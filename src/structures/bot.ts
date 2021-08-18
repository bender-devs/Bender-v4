import { EventEmitter } from 'stream';
import * as types from '../data/types';
import * as gatewayTypes from '../data/gatewayTypes';
import APIInterface from './apiInterface';
import CacheHandler from '../utils/cacheHandler';
import Gateway from './gateway';
import Logger from './logger';
import { GATEWAY_ERROR_RECONNECT_TIMEOUT, GATEWAY_PARAMS } from '../data/constants';

export default class Bot extends EventEmitter {
    api: APIInterface;
    cache: CacheHandler;
    gateway: Gateway;
    logger: Logger;
    timeouts: types.TimeoutList;
    user!: types.User;

    constructor() {
        super();
        this.api = new APIInterface(this, true);
        this.cache = new CacheHandler(this);
        this.gateway = new Gateway(this);
        this.logger = new Logger(this);
        this.timeouts = {
            gatewayError: []
        };
    }

    async connect(identifyData: gatewayTypes.IdentifyData, autoReconnect = true, useCache = false) {
        let gatewayInfo: gatewayTypes.GatewayBotInfo | null = null;
        if (useCache) {
            gatewayInfo = await this.cache.gatewayInfo.get();
        }
        if (!gatewayInfo) {
            gatewayInfo = await this.api.gateway.getBotInfo().catch(err => this.logger.handleError(err, null));
        }
        if (!gatewayInfo) {
            this.logger.handleError({
                name: 'GET_GATEWAY_FAILED',
                message: 'Failed to get gateway info.'
            }, null);
            if (autoReconnect) {
                this.timeouts.gatewayError.push(setTimeout(() => this.connect(identifyData, true), GATEWAY_ERROR_RECONNECT_TIMEOUT));
            }
            return null;
        }
        return this.gateway.connect(gatewayInfo.url, GATEWAY_PARAMS).then(() => {
            return this.gateway.identify(identifyData);
        });
    }
}