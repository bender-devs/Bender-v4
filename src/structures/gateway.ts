import * as gatewayTypes from '../data/gatewayTypes';
import * as types from '../data/types';
import Bot from './bot';
import MiscUtils from '../utils/misc';
import { GATEWAY_OPCODES } from '../data/numberTypes';
import { EventEmitter } from 'stream';
import { GATEWAY_PARAMS } from '../data/constants';
import { inflate, constants as zconst } from 'zlib';
import { promisify } from 'util';

const inflateAsync = promisify(inflate);

export default class Gateway extends EventEmitter {
    bot: Bot;
    decoder: TextDecoder;
    version?: number;
    sessionID?: string;
    ws!: WebSocket;

    #promiseResolve: ((value: unknown) => void) | null = null;
    #promiseReject: ((value: unknown) => void) | null = null;
    #heartbeatInterval: NodeJS.Timeout | null = null;
    #lastSequenceNumber: number | null = null;

    constructor(bot: Bot) {
        super();

        this.bot = bot;

        this.decoder = new TextDecoder();

        this.on('connect', (ev: Event) => {
            if (this.#promiseResolve) {
                this.#promiseResolve(true);
                this.#promiseResolve = null;
            }
            this.bot.logger.debug('GATEWAY CONNECTED', ev);
        });

        this.on('error', (ev: Event) => {
            if (this.#promiseReject) {
                this.#promiseReject(ev);
                this.#promiseReject = null;
            }
            this.bot.logger.handleError('GATEWAY ERROR', ev.type, ev);
        });

        this.on('message', async (ev: MessageEvent): Promise<boolean> => {
            this.bot.logger.debug('GATEWAY MESSAGE', ev.data);
            // decode from buffer to string
            let payloadText: string;
            if (typeof ev.data === 'string') {
                payloadText = ev.data;
            } else if (ev.data instanceof Buffer) {
                const lastChar = ev.data[ev.data.length - 1];
                if (GATEWAY_PARAMS.compress && lastChar === zconst.Z_SYNC_FLUSH) {
                    let err: Error | null = null;
                    payloadText = await inflateAsync(ev.data).then(data => data.toString()).catch(error => {
                        err = error;
                        return '';
                    });
                    if (err || !payloadText) {
                        this.bot.logger.handleError('GATEWAY MESSAGE ZLIB ERROR', 'Failed to parse gateway message:', err, ev.data);
                        return false;
                    }
                } else {
                    payloadText = this.decoder.decode(ev.data);
                }
            } else {
                this.bot.logger.handleError('GATEWAY MESSAGE ERROR', 'Failed to parse gateway message:', ev.data);
                return false;
            }
            let parsedPayload: gatewayTypes.GatewayPayload;
            try {
                parsedPayload = JSON.parse(payloadText);
            } catch(err) {
                this.bot.logger.handleError('GATEWAY MESSAGE ERROR', 'Failed to parse gateway message:', err, ev.data);
                return false;
            }
            switch(parsedPayload.op) {
                case GATEWAY_OPCODES.DISPATCH: {
                    const payload = parsedPayload as gatewayTypes.EventPayload;
                    this.#lastSequenceNumber = payload.s;
                    return this.bot.emit(payload.t, payload.d);
                }
                case GATEWAY_OPCODES.HELLO: {
                    const payload = parsedPayload as gatewayTypes.HelloPayload;
                    return this.#setupHeartbeat(payload);
                }
                // TODO: add the rest of the opcodes
            }
            return false;
        });

        this.on('disconnect', () => {
            // TODO: handle error codes
            if (this.#heartbeatInterval) {
                clearInterval(this.#heartbeatInterval);
            }
            // TODO: reconnect/add reconnect event
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
            this.ws.onopen = (ev: Event) => this.emit('connect', ev);
            this.ws.onerror = (ev: Event) => this.emit('error', ev);
            this.ws.onmessage = (ev: MessageEvent) => this.emit('message', ev);
        });
    }

    async identify(identifyData: gatewayTypes.IdentifyData) {
        const payload: gatewayTypes.IdentifyPayload = {
            op: GATEWAY_OPCODES.IDENTIFY,
            d: identifyData,
            s: null,
            t: null
        }
        this.bot.logger.debug('GATEWAY IDENTIFY', payload);
        return this.sendData(payload);
    }

    async heartbeat() {
        const payload: gatewayTypes.HeartbeatPayload = {
            op: GATEWAY_OPCODES.HEARTBEAT,
            d: this.#lastSequenceNumber,
            s: null,
            t: null
        }
        this.bot.logger.debug('GATEWAY HEARTBEAT', payload);
        return this.sendData(payload);
    }

    // TODO: add the rest of the gateway events
}