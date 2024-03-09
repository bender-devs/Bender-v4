import EventEmitter from 'events';
import {
    EXIT_CODE_NO_RESTART,
    GATEWAY_ERROR_RECONNECT,
    GATEWAY_ERROR_RECONNECT_TIMEOUT,
    GATEWAY_PARAMS,
    USE_CACHE,
} from '../data/constants.js';
import PendingInteractionUtils from '../interactionUtils/pending.js';
import type { GatewayBotInfo, IdentifyData, ShardConnectionData } from '../types/gatewayTypes.js';
import { CLIENT_STATE } from '../types/numberTypes.js';
import type { PartialApplication, TimeoutList, User } from '../types/types.js';
import MiscUtils from '../utils/misc.js';
import PermissionUtils from '../utils/permissions.js';
import TextUtils from '../utils/text.js';
import APIInterface from './apiInterface.js';
import CacheHandler from './cacheHandler.js';
import CommandManager from './commandManager.js';
import DatabaseManager from './db.js';
import EventManager from './eventManager.js';
import Gateway from './gateway.js';
import Logger from './logger.js';
import Shard from './shard.js';

export default class Bot extends EventEmitter {
    api: APIInterface;
    db: DatabaseManager;
    cache: CacheHandler;
    perms: PermissionUtils;
    utils: MiscUtils;
    gateway: Gateway;
    logger: Logger;
    events: EventManager;
    commandManager: CommandManager;
    interactionUtils: PendingInteractionUtils;

    shard?: Shard;
    user!: User;
    application?: PartialApplication;

    timeouts: TimeoutList;
    state: CLIENT_STATE;
    useCache: boolean;
    initialized = false;

    constructor(shard_data?: ShardConnectionData) {
        super();
        this.logger = new Logger(this);

        process.removeAllListeners('unhandledRejection');
        process.on('unhandledRejection', (error) => {
            this.logger.handleError('UNHANDLED REJECTION', error);
        });

        this.api = new APIInterface(this, true);
        this.cache = new CacheHandler(this);
        this.db = new DatabaseManager(this);
        this.perms = new PermissionUtils(this);
        this.utils = new MiscUtils(this);
        this.gateway = new Gateway(this);
        this.events = new EventManager(this);
        this.commandManager = new CommandManager(this);
        this.interactionUtils = new PendingInteractionUtils(this);

        if (shard_data) {
            this.shard = new Shard(this, shard_data);
        }

        this.timeouts = {
            gatewayError: [],
        };
        this.state = CLIENT_STATE.DEAD;
        this.useCache = USE_CACHE;

        this.events.addAllListeners();

        if (this.shard) {
            process.on('message', this.shard.handleMessage.bind(this.shard));
        }
    }

    async init(flushCache = false) {
        await this.cache.init(flushCache).catch((err) => this.logger.handleError('REDIS ERROR', err));
        let dbError: unknown;
        await this.db.connect().catch((err) => {
            dbError = err;
            this.logger.handleError('DATABASE ERROR', err);
        });
        if (dbError) {
            process.exit(EXIT_CODE_NO_RESTART);
        }
        // TODO: create checkup interval
        this.initialized = true;
    }

    async connect(identifyData: IdentifyData, reconnect = false) {
        this.logger.debug('BOT CONNECT', 'Connect method called...');

        if (!this.initialized) {
            this.logger.handleError('BOT CONNECT', 'Tried to call connect() before init()!');
            return null;
        }

        this.timeouts.gatewayError = [];
        let gatewayInfo: GatewayBotInfo | null = null;
        if (this.useCache) {
            this.logger.debug('BOT CONNECT', 'Checking cache for gateway info...');
            gatewayInfo = await this.cache.gatewayInfo.get();
        }
        if (!gatewayInfo) {
            this.logger.debug('BOT CONNECT', 'Cache enabled, but no cached gateway info found...');
            gatewayInfo = await this.api.gateway.getBotInfo().catch((err) => {
                this.logger.handleError('GET GATEWAY', err);
                return null;
            });
        }
        if (!gatewayInfo) {
            if (GATEWAY_ERROR_RECONNECT) {
                this.logger.debug('GET GATEWAY', `Retrying in ${GATEWAY_ERROR_RECONNECT_TIMEOUT}ms...`);
                this.timeouts.gatewayError.push(
                    setTimeout(() => this.connect(identifyData, reconnect), GATEWAY_ERROR_RECONNECT_TIMEOUT)
                );
                return null; // TODO: better way to indicate a retry will happen?
            } else {
                this.logger.handleError('GET GATEWAY', 'Failed to get gateway, and retrying is not enabled.');
                process.exit(EXIT_CODE_NO_RESTART);
            }
        }
        this.cache.gatewayInfo.set(gatewayInfo);
        //this.logger.debug('BOT CONNECT', gatewayInfo);
        const wsURL = gatewayInfo.url + TextUtils.parseQueryString(GATEWAY_PARAMS);
        return this.gateway.connectAndIdentify(wsURL, identifyData);
    }
}
