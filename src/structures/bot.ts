import { EventEmitter } from 'stream';
import * as types from '../data/types';
import * as gatewayTypes from '../data/gatewayTypes';
import APIInterface from './apiInterface';
import CacheHandler from '../utils/cacheHandler';

export default class Bot extends EventEmitter {
    api: APIInterface;
    cache: CacheHandler;
    user!: types.User;

    constructor() {
        super();
        this.api = new APIInterface(this, true);
        this.cache = new CacheHandler(this);
    }

    async connect(options: gatewayTypes.IdentifyData) {
        const gatewayInfo = await this.api.gateway.getBotInfo();
    }
}