import * as gatewayTypes from '../data/gatewayTypes';
import * as types from '../data/types';
import Bot from './bot';
import MiscUtils from '../utils/misc';
import { CUSTOM_GATEWAY_ERRORS, GATEWAY_ERRORS, GATEWAY_OPCODES } from '../data/numberTypes';
import { EventEmitter } from 'stream';
import { GATEWAY_PARAMS, HEARTBEAT_TIMEOUT, EXIT_CODE_NO_RESTART, EXIT_CODE_RESTART } from '../data/constants';
import * as zlib from 'zlib';
import * as WebSocket from 'ws';

const ZLIB_SUFFIX = [0x00, 0x00, 0xFF, 0xFF];

export default class Gateway extends EventEmitter {
    bot: Bot;
    decoder: TextDecoder;
    version?: number;
    sessionID?: string;
    ws!: WebSocket;

    #promiseResolve: ((value: unknown) => void) | null = null;
    #promiseReject: ((value: unknown) => void) | null = null;
    #heartbeatInterval: NodeJS.Timeout | null = null;
    #heartbeatTimeout: NodeJS.Timeout | null = null;
    #lastSequenceNumber: number | null = null;
    #identifyData: gatewayTypes.IdentifyData | null = null;

    #inflator: zlib.Inflate;
    #inflateResolve?: (chunk: any) => void;
    #inflateReject?: (err: Error) => void;
    #inflate(data: Buffer) {
        return new Promise<Buffer>((resolve, reject) => {
            this.#inflateResolve = resolve;
            this.#inflateReject = reject;
            this.#inflator.write(data);
        })
    }

    constructor(bot: Bot) {
        super();

        this.bot = bot;

        this.decoder = new TextDecoder();
        this.#inflator = zlib.createInflate({
            chunkSize: 65535,
            flush: zlib.constants.Z_SYNC_FLUSH
        });
        this.#inflator.on('data', inflatedData => {
            if (this.#inflateResolve) {
                this.#inflateResolve(inflatedData);
                this.#inflateResolve = undefined;
            } else {
                this.bot.logger.handleError('UNHANDLED ZLIB DATA', inflatedData);
            }
        });
        this.#inflator.on('error', err => {
            if (this.#inflateReject) {
                this.#inflateReject(err);
                this.#inflateReject = undefined;
            } else {
                this.bot.logger.handleError('UNHANDLED ZLIB ERROR', err);
            }
        });

        this.on('connect', (ev: WebSocket.OpenEvent) => {
            if (this.#promiseResolve) {
                this.#promiseResolve(true);
                this.#promiseResolve = null;
            }
            this.bot.logger.debug('GATEWAY CONNECTED', ev);
        });

        this.on('error', (ev: WebSocket.ErrorEvent) => {
            if (this.#promiseReject) {
                this.#promiseReject(ev);
                this.#promiseReject = null;
            }
            this.bot.logger.handleError('GATEWAY ERROR', ev.type, ev);
        });

        this.on('message', async (eventData: WebSocket.MessageEvent): Promise<boolean> => {
            //this.bot.logger.debug('GATEWAY MESSAGE', eventData);
            let payloadText: string;
            if (typeof eventData === 'string') {
                payloadText = eventData;
            } else if (eventData instanceof Buffer) {
                let suffixed = true;
                const suffix = eventData.slice(-4);
                for (let i = 0; i < suffix.length; i++) {
                    if (suffix[i] !== ZLIB_SUFFIX[i]) {
                        suffixed = false;
                        break;
                    }
                }
                if (GATEWAY_PARAMS.compress && suffixed) {
                    let err: Error | null = null;
                    payloadText = await this.#inflate(eventData).then(data => data.toString('utf8')).catch(error => {
                        err = error;
                        return '';
                    });
                    if (err || !payloadText) {
                        this.bot.logger.handleError('GATEWAY MESSAGE ERROR', err);
                        return false;
                    }
                } else {
                    payloadText = this.decoder.decode(eventData);
                }
            } else {
                this.bot.logger.handleError('GATEWAY MESSAGE ERROR', 'Failed to parse gateway message:', eventData);
                return false;
            }
            let parsedPayload: gatewayTypes.GatewayPayload;
            try {
                parsedPayload = JSON.parse(payloadText);
            } catch(err) {
                this.bot.logger.handleError('GATEWAY MESSAGE ERROR', 'Failed to parse gateway message:', err, eventData);
                return false;
            }
            this.bot.logger.debug('GATEWAY MESSAGE PARSED', parsedPayload);
            switch(parsedPayload.op) {
                case GATEWAY_OPCODES.DISPATCH: {
                    const payload = parsedPayload as gatewayTypes.EventPayload;
                    if (payload.t === 'READY' && 'session_id' in payload.d) {
                        this.sessionID = payload.d.session_id;
                    }
                    this.#lastSequenceNumber = payload.s;
                    return this.bot.emit(payload.t, payload.d);
                }
                case GATEWAY_OPCODES.HELLO: {
                    const payload = parsedPayload as gatewayTypes.HelloPayload;
                    return this.#setupHeartbeat(payload);
                }
                case GATEWAY_OPCODES.HEARTBEAT: {
                    this.heartbeat();
                    return true;
                }
                case GATEWAY_OPCODES.RECONNECT: {
                   this.ws.close(CUSTOM_GATEWAY_ERRORS.RECONNECT_REQUESTED);
                    return false;
                }
                case GATEWAY_OPCODES.INVALID_SESSION: {
                    this.ws.close(CUSTOM_GATEWAY_ERRORS.INVALID_SESSION);
                    return false;
                }
                case GATEWAY_OPCODES.HEARTBEAT_ACK: {
                    if (this.#heartbeatTimeout) {
                        clearTimeout(this.#heartbeatTimeout);
                    }
                    return false;
                }
            }
            return false;
        });

        this.on('disconnect', (ev: WebSocket.CloseEvent) => {
            if (this.#heartbeatInterval) {
                clearInterval(this.#heartbeatInterval);
            }
            this.bot.logger.handleError('WEBSOCKET DISCONNECT', ev);
            switch (ev.code) {
                case GATEWAY_ERRORS.AUTHENTICATION_FAILED:
                case GATEWAY_ERRORS.INVALID_SHARD:
                case GATEWAY_ERRORS.SHARDING_REQUIRED:
                case GATEWAY_ERRORS.INVALID_VERSION:
                case GATEWAY_ERRORS.INVALID_INTENTS:
                case GATEWAY_ERRORS.DISALLOWED_INTENTS: {
                    this.bot.logger.log('FATAL: Not reconnecting this client.');
                    process.exit(EXIT_CODE_NO_RESTART);
                }
                case CUSTOM_GATEWAY_ERRORS.INVALID_SESSION:
                // @ts-ignore: Fallthrough case
                case GATEWAY_ERRORS.SESSION_TIMED_OUT: {
                    this.sessionID = undefined;
                    this.#lastSequenceNumber = null;
                }
                default: {
                    if (this.sessionID && this.#lastSequenceNumber && this.#identifyData) {
                        return this.resume({
                            session_id: this.sessionID,
                            seq: this.#lastSequenceNumber,
                            token: this.#identifyData.token
                        });
                    } else if (this.#identifyData) {
                        return this.identify(this.#identifyData);
                    }
                    process.exit(EXIT_CODE_RESTART);
                }
            }
        })
    }

    #setupHeartbeat(payload: gatewayTypes.HelloPayload) {
        this.#heartbeatInterval = setInterval(() => this.heartbeat(), payload.d.heartbeat_interval);
        return true;
    };

    async sendData(data: unknown) {
        if (!this.ws) {
            return this.bot.logger.handleError('GATEWAY sendData', gatewayTypes.ERRORS.PAYLOAD_SENT_BEFORE_WS);
        }
        if (this.ws.readyState !== WebSocket.OPEN) {
            return this.bot.logger.handleError('GATEWAY sendData', gatewayTypes.ERRORS.PAYLOAD_SENT_BEFORE_CONNECT);
        }
        let stringifiedData: string | null = null;
        try {
            stringifiedData = JSON.stringify(data);
        }
        catch(err) {
            this.bot.logger.handleError('GATEWAY sendData', err as Error);
        }
        if (!stringifiedData) {
            return null;
        }
        return this.ws.send(stringifiedData);
    }

    async connect(gatewayURL: types.URL, params: gatewayTypes.GatewayParams) {
        const wsURL = gatewayURL + MiscUtils.parseQueryString(params);
        this.bot.logger.debug('GATEWAY CONNECT', wsURL)
        this.ws = new WebSocket(wsURL);
        return new Promise((resolve: (value: unknown) => void, reject: (reason?: any) => void) => {
            this.#promiseResolve = resolve;
            this.#promiseReject = reject;
            this.ws.on('open', (ev: WebSocket.OpenEvent) => this.emit('connect', ev));
            this.ws.on('error', (ev: WebSocket.ErrorEvent) => this.emit('error', ev));
            this.ws.on('message', (ev: WebSocket.MessageEvent) => this.emit('message', ev));
            this.ws.on('close', (ev: WebSocket.CloseEvent) => this.emit('disconnect', ev));
        });
    }

    async identify(identifyData: gatewayTypes.IdentifyData) {
        this.#identifyData = identifyData;
        const payload: gatewayTypes.IdentifyPayload = {
            op: GATEWAY_OPCODES.IDENTIFY,
            d: identifyData,
            s: null,
            t: null
        }
        this.bot.logger.debug('SEND GATEWAY IDENTIFY', payload);
        return this.sendData(payload);
    }

    async heartbeat() {
        const payload: gatewayTypes.HeartbeatPayload = {
            op: GATEWAY_OPCODES.HEARTBEAT,
            d: this.#lastSequenceNumber,
            s: null,
            t: null
        }
        this.bot.logger.debug('SEND GATEWAY HEARTBEAT', payload);
        this.#heartbeatTimeout = setTimeout(() => {
            this.ws.close(CUSTOM_GATEWAY_ERRORS.HEARTBEAT_TIMEOUT);
        }, HEARTBEAT_TIMEOUT);
        return this.sendData(payload);
    }

    async updatePresence(presenceData: gatewayTypes.UpdatePresenceData) {
        const payload: gatewayTypes.UpdatePresencePayload = {
            op: GATEWAY_OPCODES.PRESENCE_UPDATE,
            d: presenceData,
            s: null,
            t: null
        }
        this.bot.logger.debug('SEND GATEWAY PRESENCE', payload);
        return this.sendData(payload);
    }

    async updateVoiceState(voiceStateData: gatewayTypes.VoiceUpdateData) {
        const payload: gatewayTypes.VoiceUpdatePayload = {
            op: GATEWAY_OPCODES.VOICE_STATE_UPDATE,
            d: voiceStateData,
            s: null,
            t: null
        }
        this.bot.logger.debug('SEND GATEWAY VOICE STATE', payload);
        return this.sendData(payload);
    }

    async resume(resumeData: gatewayTypes.ResumeData) {
        const payload: gatewayTypes.ResumePayload = {
            op: GATEWAY_OPCODES.RESUME,
            d: resumeData,
            s: null,
            t: null
        }
        this.bot.logger.debug('SEND GATEWAY RESUME', payload);
        return this.sendData(payload);
    }
    
    async requestGuildMembers(requestGuildMembersData: gatewayTypes.RequestMembersData) {
        const payload: gatewayTypes.RequestMembersPayload = {
            op: GATEWAY_OPCODES.REQUEST_GUILD_MEMBERS,
            d: requestGuildMembersData,
            s: null,
            t: null
        }
        this.bot.logger.debug('SEND GATEWAY REQUEST MEMBERS', payload);
        return this.sendData(payload);
    }
}