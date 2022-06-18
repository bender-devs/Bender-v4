import { EventEmitter } from 'stream';
import * as types from '../types/types';
import * as gatewayTypes from '../types/gatewayTypes';
import APIInterface from './apiInterface';
import CacheHandler from './cacheHandler';
import Gateway from './gateway';
import Logger from './logger';
import { GATEWAY_ERROR_RECONNECT, GATEWAY_ERROR_RECONNECT_TIMEOUT, GATEWAY_PARAMS, EXIT_CODE_NO_RESTART, USE_CACHE } from '../data/constants';
import { CLIENT_STATE } from '../types/numberTypes';
import EventManager from './eventManager';
import Shard from './shard';
import CommandManager from './commandManager';
import MiscUtils from '../utils/misc';

export default class Bot extends EventEmitter {
    api: APIInterface;
    cache: CacheHandler;
    gateway: Gateway;
    logger: Logger;
    events: EventManager;
    commandManager: CommandManager;

    shard?: Shard;
    user!: types.User;
    application?: types.PartialApplication;

    timeouts: types.TimeoutList;
    state: CLIENT_STATE;
    useCache: boolean;

    constructor(shard_data?: gatewayTypes.ShardConnectionData) {
        super();
        this.logger = new Logger(this);

        process.removeAllListeners('unhandledRejection');
        process.on('unhandledRejection', error => {
            this.logger.handleError('UNHANDLED REJECTION', error);
        })

        this.api = new APIInterface(this, true);
        this.cache = new CacheHandler(this);
        this.gateway = new Gateway(this);
        this.events = new EventManager(this);
        this.commandManager = new CommandManager(this);

        if (shard_data) {
            this.shard = new Shard(this, shard_data);
        }

        this.timeouts = {
            gatewayError: []
        };
        this.state = CLIENT_STATE.DEAD;
        this.useCache = USE_CACHE;

        this.events.addAllListeners();

        if (this.shard) {
            process.on('message', this.shard.handleMessage.bind(this.shard));
        }
    }

    async init() {
        // TODO: connect to DB
        // TODO: create checkup interval
    }

    async connect(identifyData: gatewayTypes.IdentifyData, reconnect = false) {
        this.logger.debug('BOT CONNECT', 'Connect method called...');

        // TODO: check if init() was called; if not, don't connect
        
        if (!this.cache.initialized) {
            await this.cache.init().catch(err => this.logger.handleError('REDIS ERROR', err));
        }
        this.timeouts.gatewayError = [];
        let gatewayInfo: gatewayTypes.GatewayBotInfo | null = null;
        if (this.useCache) {
            this.logger.debug('BOT CONNECT', 'Checking cache for gateway info...');
            gatewayInfo = await this.cache.gatewayInfo.get();
        }
        if (!gatewayInfo) {
            this.logger.debug('BOT CONNECT', 'Cache enabled, but no cached gateway info found...')
            gatewayInfo = await this.api.gateway.getBotInfo().catch(err => {
                this.logger.handleError('GET GATEWAY', err);
                return null;
            });
        }
        if (!gatewayInfo) {
            if (GATEWAY_ERROR_RECONNECT) {
                this.logger.debug('GET GATEWAY', `Retrying in ${GATEWAY_ERROR_RECONNECT_TIMEOUT}ms...`);
                this.timeouts.gatewayError.push(setTimeout(() => this.connect(identifyData, reconnect), GATEWAY_ERROR_RECONNECT_TIMEOUT));
                return null; // TODO: better way to indicate a retry will happen?
            } else {
                this.logger.handleError('GET GATEWAY', 'Failed to get gateway, and retrying is not enabled.');
                process.exit(EXIT_CODE_NO_RESTART);
            }
        }
        this.cache.gatewayInfo.set(gatewayInfo);
        //this.logger.debug('BOT CONNECT', gatewayInfo);
        const wsURL = gatewayInfo.url + MiscUtils.parseQueryString(GATEWAY_PARAMS);
        return this.gateway.connectAndIdentify(wsURL, identifyData);
    }
}