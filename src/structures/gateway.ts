import * as gatewayTypes from '../data/gatewayTypes';
import * as types from '../data/types';
import Bot from './bot';
import MiscUtils from '../utils/misc';
import { GATEWAY_OPCODES } from '../data/numberTypes';
import { EventEmitter } from 'stream';

export default class Gateway extends EventEmitter {
    bot: Bot;
    ws!: WebSocket;

    #promiseResolve: ((value: unknown) => void) | null = null;
    #promiseReject: ((value: unknown) => void) | null = null;
    #heartbeatInterval: NodeJS.Timeout | null = null;
    #lastSequenceNumber: number | null = null;

    constructor(bot: Bot) {
        super();
        this.bot = bot;
        this.on('connect', (ev: Event) => {
            if (this.#promiseResolve) {
                this.#promiseResolve(true);
                this.#promiseResolve = null;
            }
            this.bot.log.debug('[GATEWAY_CONNECT]', ev);
        });
        this.on('error', (ev: Event) => {
            if (this.#promiseReject) {
                this.#promiseReject(ev);
                this.#promiseReject = null;
            }
            this.bot.log.handleError({
                name: 'GATEWAY_GENERIC_ERROR',
                message: ev.type
            }, null, ev);
        });
        this.on('message', (ev: MessageEvent): boolean => {
            const genericPayload: gatewayTypes.GatewayPayload = ev.data;
            switch(genericPayload.op) {
                case GATEWAY_OPCODES.DISPATCH: {
                    const payload: gatewayTypes.EventPayload = ev.data;
                    this.#lastSequenceNumber = payload.s;
                    return this.bot.emit(payload.t, payload.d);
                }
                case GATEWAY_OPCODES.HELLO: {
                    const payload: gatewayTypes.HelloPayload = ev.data;
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
            return this.bot.log.handleError({
                name: 'PAYLOAD_SENT_BEFORE_WS',
                message: gatewayTypes.ERRORS.PAYLOAD_SENT_BEFORE_WS
            }, null);
        }
        if (this.ws.readyState !== WebSocket.OPEN) {
            return this.bot.log.handleError({
                name: 'PAYLOAD_SENT_BEFORE_CONNECT',
                message: gatewayTypes.ERRORS.PAYLOAD_SENT_BEFORE_CONNECT
            }, null);
        }
        let stringifiedData: string | null = null;
        try {
            stringifiedData = JSON.stringify(data);
        }
        catch(err) {
            this.bot.log.handleError(err, null);
        }
        if (!stringifiedData) {
            return null;
        }
        return this.ws.send(stringifiedData);
    }

    async connect(gatewayURL: types.URL, params: gatewayTypes.GatewayParams) {
        const queryString = MiscUtils.parseQueryString(params);
        this.ws = new WebSocket(gatewayURL + queryString);
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
        return this.sendData(payload);
    }

    async heartbeat() {
        const payload: gatewayTypes.HeartbeatPayload = {
            op: GATEWAY_OPCODES.HEARTBEAT,
            d: this.#lastSequenceNumber,
            s: null,
            t: null
        }
        return this.sendData(payload);
    }

    // TODO: add the rest of the gateway events
}