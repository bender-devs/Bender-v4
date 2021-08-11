import { EventEmitter } from 'stream';
import * as types from '../data/types';
import APIInterface from './apiInterface';
import * as redis from 'redis';

export default class Bot extends EventEmitter {
    api: APIInterface;
    user!: types.User;
    redisClient: redis.RedisClient;

    constructor() {
        super();
        this.api = new APIInterface(this);
        this.redisClient = redis.createClient();
        this.redisClient.on("error", err => this.emit("redis_error", err));
    }

    connect(options: types.ClientConnectionOptions) {
        
    }
}