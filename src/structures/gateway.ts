import EventEmitter from 'events';
import WS from 'ws';
import zlib from 'zlib-sync';
import { EXIT_CODE_NO_RESTART, EXIT_CODE_RESTART, GATEWAY_PARAMS, HEARTBEAT_TIMEOUT } from '../data/constants.js';
import * as gatewayTypes from '../types/gatewayTypes.js';
import { CLIENT_STATE, CUSTOM_GATEWAY_ERRORS, GATEWAY_ERRORS, GATEWAY_OPCODES } from '../types/numberTypes.js';
import TimeUtils from '../utils/time.js';
import type Bot from './bot.js';

const ZLIB_SUFFIX = [0x00, 0x00, 0xff, 0xff];

export default class Gateway extends EventEmitter {
    bot: Bot;
    decoder: TextDecoder;
    version?: number;
    sessionID?: string;
    ws!: WS;
    ping = -1;

    #beginTimestamp = -1;
    #promiseResolve: ((value: unknown) => void) | null = null;
    #promiseReject: ((value: unknown) => void) | null = null;
    #heartbeatInterval: NodeJS.Timeout | null = null;
    #heartbeatTimeout: NodeJS.Timeout | null = null;
    #lastHeartbeat = -1;
    #lastSequenceNumber: number | null = null;
    #identifyData: gatewayTypes.IdentifyData | null = null;

    #inflator!: zlib.Inflate;
    #inflate(data: Buffer) {
        this.#inflator.push(data, zlib.Z_SYNC_FLUSH);
        if (this.#inflator.err < 0) {
            this.bot.logger.handleError('ZLIB ERROR', this.#inflator.msg);
            return null;
        }
        return this.#inflator.result?.toString('utf8') || null;
    }

    constructor(bot: Bot) {
        super();

        this.bot = bot;

        this.decoder = new TextDecoder();
        this.#createInflator();

        this.on('connect', this.#handleConnectEvent);
        this.on('error', this.#handleErrorEvent);
        this.on('message', this.#handleMessageEvent);
        this.on('disconnect', this.#handleDisconnectEvent);
    }

    #createInflator() {
        this.#inflator = new zlib.Inflate({ chunkSize: 65535 });
    }

    async #handleConnectEvent() {
        if (this.#promiseResolve) {
            this.#promiseResolve(true);
            this.#promiseResolve = null;
        }
        this.ping = TimeUtils.sinceMillis(this.#beginTimestamp);
        this.bot.logger.debug('GATEWAY CONNECTED', `${this.ping}ms`);
    }

    async #handleErrorEvent(err: Error) {
        if (this.#promiseReject) {
            this.#promiseReject(err);
            this.#promiseReject = null;
        }
        this.bot.logger.handleError('GATEWAY ERROR', err);
    }

    async #handleMessageEvent(data: WS.RawData | string): Promise<boolean> {
        let payloadText: string;
        if (typeof data === 'string') {
            payloadText = data;
        } else if (data instanceof Buffer) {
            let suffixed = true;
            const suffix = data.slice(-4);
            for (let i = 0; i < suffix.length; i++) {
                if (suffix[i] !== ZLIB_SUFFIX[i]) {
                    suffixed = false;
                    break;
                }
            }
            if (GATEWAY_PARAMS.compress && suffixed) {
                payloadText = this.#inflate(data) || '';
                if (!payloadText) {
                    return false;
                }
            } else {
                payloadText = this.decoder.decode(data);
            }
        } else {
            this.bot.logger.handleError('GATEWAY MESSAGE ERROR', 'Failed to parse gateway message:', data);
            return false;
        }
        let parsedPayload: gatewayTypes.GatewayPayload;
        try {
            parsedPayload = JSON.parse(payloadText);
        } catch (err) {
            this.bot.logger.handleError('GATEWAY MESSAGE ERROR', 'Failed to parse gateway message:', err, data);
            return false;
        }
        if (parsedPayload.op !== GATEWAY_OPCODES.DISPATCH) {
            this.bot.logger.debug('GATEWAY MESSAGE PARSED', parsedPayload);
        }
        switch (parsedPayload.op) {
            case GATEWAY_OPCODES.DISPATCH: {
                const payload = parsedPayload as gatewayTypes.EventPayload;
                if (payload.t === 'READY' && payload.d && 'session_id' in payload.d) {
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
                this.ws.close(CUSTOM_GATEWAY_ERRORS.RECONNECT_REQUESTED, 'RECONNECT_REQUESTED');
                return false;
            }
            case GATEWAY_OPCODES.INVALID_SESSION: {
                this.ws.close(CUSTOM_GATEWAY_ERRORS.INVALID_SESSION, 'INVALID_SESSION');
                return false;
            }
            case GATEWAY_OPCODES.HEARTBEAT_ACK: {
                this.ping = TimeUtils.sinceMillis(this.#lastHeartbeat);
                this.#lastHeartbeat = -1;
                if (this.#heartbeatTimeout) {
                    clearTimeout(this.#heartbeatTimeout);
                }
                return false;
            }
        }
        return false;
    }

    async #handleDisconnectEvent(code: number, reason: Buffer | string) {
        if (this.#heartbeatInterval) {
            clearInterval(this.#heartbeatInterval);
        }
        if (reason instanceof Buffer) {
            reason = reason.toString();
        }
        this.bot.logger.handleError('WS DISCONNECT', { code, reason });
        switch (code) {
            case GATEWAY_ERRORS.AUTHENTICATION_FAILED:
            case GATEWAY_ERRORS.INVALID_SHARD:
            case GATEWAY_ERRORS.SHARDING_REQUIRED:
            case GATEWAY_ERRORS.INVALID_VERSION:
            case GATEWAY_ERRORS.INVALID_INTENTS:
            case GATEWAY_ERRORS.DISALLOWED_INTENTS: {
                this.bot.logger.moduleLog('FATAL WS CODE', 'Not reconnecting this client.');
                process.exit(EXIT_CODE_NO_RESTART);
            }
            case CUSTOM_GATEWAY_ERRORS.INVALID_SESSION:
            case GATEWAY_ERRORS.SESSION_TIMED_OUT:
            default: {
                if (code === CUSTOM_GATEWAY_ERRORS.INVALID_SESSION || code === GATEWAY_ERRORS.SESSION_TIMED_OUT) {
                    // session is invalid, make sure it won't attempt to resume
                    this.sessionID = undefined;
                    this.#lastSequenceNumber = null;
                }
                if (this.sessionID && this.#lastSequenceNumber && this.#identifyData) {
                    return this.resume({
                        session_id: this.sessionID,
                        seq: this.#lastSequenceNumber,
                        token: this.#identifyData.token,
                    });
                } else if (this.#identifyData) {
                    this.bot.logger.debug('WS DISCONNECTED', 'Invalid session, reconnecting...');
                    return this.connectAndIdentify(this.ws.url, this.#identifyData, true);
                }
                this.bot.logger.debug(
                    'WS DISCONNECTED',
                    'Invalid session and no identify data cached, restarting...'
                );
                process.exit(EXIT_CODE_RESTART);
            }
        }
    }

    #setupHeartbeat(payload: gatewayTypes.HelloPayload) {
        this.#heartbeatInterval = setInterval(() => this.heartbeat(), payload.d.heartbeat_interval);
        return true;
    }

    async sendData(data: gatewayTypes.NonEventPayload) {
        if (!this.ws) {
            return this.bot.logger.handleError('GATEWAY sendData', gatewayTypes.ERRORS.PAYLOAD_SENT_BEFORE_WS);
        }
        if (this.ws.readyState !== WS.OPEN) {
            return this.bot.logger.handleError(
                'GATEWAY sendData',
                gatewayTypes.ERRORS.PAYLOAD_SENT_BEFORE_CONNECT
            );
        }
        let stringifiedData: string | null = null;
        try {
            stringifiedData = JSON.stringify(data);
        } catch (err) {
            this.bot.logger.handleError('GATEWAY sendData', err as Error);
        }
        if (!stringifiedData) {
            return null;
        }
        return this.ws.send(stringifiedData);
    }

    async connectAndIdentify(wsURL: string, identifyData: gatewayTypes.IdentifyData, reconnect = false) {
        return this.connect(wsURL, reconnect).then(() => {
            return this.identify(identifyData);
        });
    }

    async connect(wsURL: string, reconnect = false) {
        this.bot.logger.debug('GATEWAY CONNECT', wsURL);
        this.#beginTimestamp = Date.now();
        if (reconnect) {
            this.#createInflator();
            this.bot.state = CLIENT_STATE.RECONNECTING;
        } else {
            this.bot.state = CLIENT_STATE.CONNECTING;
        }
        this.ws = new WS(wsURL);
        return new Promise((resolve: (value: unknown) => void, reject: (reason?: unknown) => void) => {
            this.#promiseResolve = resolve;
            this.#promiseReject = reject;
            this.ws.on('open', () => this.emit('connect'));
            this.ws.on('error', (err: Error) => this.emit('error', err));
            this.ws.on('message', (data: Buffer, isBinary: boolean) => this.emit('message', data, isBinary));
            this.ws.on('close', (code: number, reason: Buffer) => this.emit('disconnect', code, reason));
        });
    }

    async identify(identifyData: gatewayTypes.IdentifyData) {
        this.#identifyData = identifyData;
        const payload: gatewayTypes.IdentifyPayload = {
            op: GATEWAY_OPCODES.IDENTIFY,
            d: identifyData,
            s: null,
            t: null,
        };
        //this.bot.logger.debug('SEND GATEWAY IDENTIFY', payload);
        return this.sendData(payload);
    }

    async heartbeat() {
        const payload: gatewayTypes.HeartbeatPayload = {
            op: GATEWAY_OPCODES.HEARTBEAT,
            d: this.#lastSequenceNumber,
            s: null,
            t: null,
        };
        this.bot.logger.debug('SEND GATEWAY HEARTBEAT', payload);
        this.#heartbeatTimeout = setTimeout(() => {
            this.ws.close(CUSTOM_GATEWAY_ERRORS.HEARTBEAT_TIMEOUT, 'HEARTBEAT_TIMEOUT');
        }, HEARTBEAT_TIMEOUT);
        this.#lastHeartbeat = Date.now();
        return this.sendData(payload);
    }

    async updatePresence(presenceData: gatewayTypes.UpdatePresenceData) {
        const payload: gatewayTypes.UpdatePresencePayload = {
            op: GATEWAY_OPCODES.PRESENCE_UPDATE,
            d: presenceData,
            s: null,
            t: null,
        };
        this.bot.cache.presences.updateSelf(presenceData);
        //this.bot.logger.debug('SEND GATEWAY PRESENCE', payload);
        return this.sendData(payload);
    }

    async updateVoiceState(voiceStateData: gatewayTypes.VoiceUpdateData) {
        const payload: gatewayTypes.VoiceUpdatePayload = {
            op: GATEWAY_OPCODES.VOICE_STATE_UPDATE,
            d: voiceStateData,
            s: null,
            t: null,
        };
        this.bot.logger.debug('SEND GATEWAY VOICE STATE', payload);
        return this.sendData(payload);
    }

    async resume(resumeData: gatewayTypes.ResumeData) {
        this.bot.logger.debug('GATEWAY RESUME', 'Reconnecting...');
        this.bot.state = CLIENT_STATE.RECONNECTING;
        return this.connect(this.ws.url, true).then(() => {
            const payload: gatewayTypes.ResumePayload = {
                op: GATEWAY_OPCODES.RESUME,
                d: resumeData,
                s: null,
                t: null,
            };
            //this.bot.logger.debug('GATEWAY RESUME', payload);
            return this.sendData(payload);
        });
    }

    async requestGuildMembers(requestGuildMembersData: gatewayTypes.RequestMembersData) {
        const payload: gatewayTypes.RequestMembersPayload = {
            op: GATEWAY_OPCODES.REQUEST_GUILD_MEMBERS,
            d: requestGuildMembersData,
            s: null,
            t: null,
        };
        this.bot.logger.debug('SEND GATEWAY REQUEST MEMBERS', payload);
        return this.sendData(payload);
    }
}
