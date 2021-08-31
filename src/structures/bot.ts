import { EventEmitter } from 'stream';
import * as types from '../data/types';
import * as gatewayTypes from '../data/gatewayTypes';
import APIInterface from './apiInterface';
import CacheHandler from '../utils/cacheHandler';
import Gateway from './gateway';
import Logger from './logger';
import { GATEWAY_ERROR_RECONNECT, GATEWAY_ERROR_RECONNECT_TIMEOUT, GATEWAY_PARAMS, USE_CACHE } from '../data/constants';
import { CLIENT_STATE } from '../data/numberTypes';
import EventManager from './eventManager';
import Shard from './shard';

export default class Bot extends EventEmitter {
    api: APIInterface;
    cache: CacheHandler;
    gateway: Gateway;
    logger: Logger;
    events: EventManager;

    shard?: Shard;
    user!: types.User;
    application?: types.PartialApplication;

    timeouts: types.TimeoutList;
    state: CLIENT_STATE;
    useCache: boolean;

    constructor(shard_data?: gatewayTypes.ShardConnectionData) {
        super();
        this.api = new APIInterface(this, true);
        this.cache = new CacheHandler(this);
        this.gateway = new Gateway(this);
        this.logger = new Logger(this);
        this.events = new EventManager(this);

        if (shard_data) {
            this.shard = new Shard(this, shard_data);
        }

        this.timeouts = {
            gatewayError: []
        };
        this.state = CLIENT_STATE.DEAD;
        this.useCache = USE_CACHE;

        this.events.addAllListeners();
    }

    async connect(identifyData: gatewayTypes.IdentifyData) {
        let gatewayInfo: gatewayTypes.GatewayBotInfo | null = null;
        if (this.useCache) {
            gatewayInfo = await this.cache.gatewayInfo.get();
        }
        if (!gatewayInfo) {
            gatewayInfo = await this.api.gateway.getBotInfo().catch(err => this.logger.handleError(err, null));
        }
        if (!gatewayInfo) {
            this.logger.handleError({
                name: 'GET_GATEWAY_FAILED',
                message: 'Failed to get gateway info.'
            });
            if (GATEWAY_ERROR_RECONNECT) {
                this.timeouts.gatewayError.push(setTimeout(() => this.connect(identifyData), GATEWAY_ERROR_RECONNECT_TIMEOUT));
            }
            return null;
        }
        return this.gateway.connect(gatewayInfo.url, GATEWAY_PARAMS).then(() => {
            return this.gateway.identify(identifyData);
        });
    }
}