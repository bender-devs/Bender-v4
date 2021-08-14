import * as types from "../data/types";
import Bot from "../structures/bot";
import { promisify } from "util";
import * as redis from 'redis';

export default class CacheHandler {
    bot: Bot;
    redisClient: redis.RedisClient;
    _get: (key: string) => Promise<string | null>;
    _hget: (key: string, field: string) => Promise<string | null>;
    _set: (key: string, value: string) => Promise<unknown>;
    _hset: (key: string, fields: types.stringMap) => Promise<unknown>;

    constructor(bot: Bot) {
        this.bot = bot;
        this.redisClient = redis.createClient();
        this.redisClient.on("error", err => this.bot.emit("redis_error", err));
        this._get = promisify(this.redisClient.get).bind(this.redisClient);
        this._hget = promisify(this.redisClient.hget).bind(this.redisClient);
        this._set = promisify(this.redisClient.set).bind(this.redisClient);
        // doing this trick because promisify() doesn't choose the correct overload
        type _hsetType = (key: string, fields: types.stringMap, callback: (error: Error | null, value: number) => void) => boolean;
        const _promisify = (command: _hsetType) => promisify(command);
        this._hset = _promisify(this.redisClient.hset).bind(this.redisClient);
    }

    get(key: string, subkey?: string) {
        if (subkey) {
            return this._hget(key, subkey);
        }
        return this._get(key);
    }

    set(key: string, value: string | types.stringMap) {
        if (typeof value === 'string') {
            return this._set(key, value);
        }
        return this._hset(key, value);
    }

    members = {
        get: (guild_id: types.Snowflake, user_id: types.Snowflake) => this.get(`guilds.${guild_id}.members.${user_id}`)
    }
}