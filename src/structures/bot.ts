import { EventEmitter } from 'stream';
import { PartialApplication, TimeoutList, User } from '../types/types';
import { GatewayBotInfo, IdentifyData, ShardConnectionData } from '../types/gatewayTypes';
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
import PermissionUtils from '../utils/permissions';
import TextUtils from '../utils/text';
import DatabaseManager from './db';
import PendingInteractionUtils from '../interactionUtils/pending';

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
        process.on('unhandledRejection', error => {
            this.logger.handleError('UNHANDLED REJECTION', error);
        })

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
        await this.cache.init().catch(err => this.logger.handleError('REDIS ERROR', err));
        let dbError: unknown;
        await this.db.connect().catch(err => {
            dbError = err;
            this.logger.handleError('DATABASE ERROR', err)
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
        const wsURL = gatewayInfo.url + TextUtils.parseQueryString(GATEWAY_PARAMS);
        return this.gateway.connectAndIdentify(wsURL, identifyData);
    }
}