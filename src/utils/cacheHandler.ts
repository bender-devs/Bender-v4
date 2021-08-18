/*
redis = global cache (used for all shards/bot versions)
- users
- user dm channel ids
- commands

localized cache:
- guilds
- members
- roles
- channels
*/
import * as types from "../data/types";
import Bot from "../structures/bot";
import { promisify } from "util";
import * as redis from 'redis';
import { GatewayBotInfo } from "../data/gatewayTypes";

// would've preferred to use Snowflake instead of string here but TS was complaining
type GuildMap = Record<string, types.Guild>;
type MemberMap = Record<string, types.Member>;
type GuildMemberMap = Record<string, MemberMap>;
type UserMap = Record<string, types.User>;
type ChannelMap = Record<string, types.Channel>;
type StringMapMap = Record<string, types.StringMap>;

// doing these tricks because promisify() doesn't choose the correct overload
type hsetType = (key: string, fields: types.StringMap, callback: redis.Callback<number>) => boolean;
const hsetPromisify = (command: hsetType) => promisify(command);
type hsetExpireType = (key: string, fields: types.StringMap, expire: types.UnixTimestamp) => (callback: redis.Callback<any[]>) => boolean;
const hsetExpirePromisify = (command: hsetExpireType) => promisify(command);

export default class CacheHandler {
    bot: Bot;
    redisClient: redis.RedisClient;
    gateway: types.URL | null = null;
    #guilds: GuildMap;
    #members: GuildMemberMap;
    #channels: ChannelMap;

    #get: (key: string) => Promise<string | null>;
    #getMultiMixed: (string_keys: string[], hash_keys: string[]) => Promise<unknown>;
    #hget: (key: string, field: string) => Promise<string | null>;
    #hgetall: (key: string) => Promise<types.StringMap | null>;
    #set: (key: string, value: string) => Promise<unknown>;
    #setExpire: (key: string, value: string, expire: types.UnixTimestamp) => Promise<unknown>;
    #setMultiMixed: (key: string, top_level_values: types.StringMap | null, values: StringMapMap | null, expire?: types.UnixTimestamp) => Promise<unknown>;
    #hset: (key: string, fields: types.StringMap) => Promise<unknown>;
    #hsetExpire: (key: string, value: types.StringMap, expire: types.UnixTimestamp) => Promise<unknown>;

    constructor(bot: Bot) {
        this.bot = bot;
        this.redisClient = redis.createClient();
        this.redisClient.on("error", err => this.bot.emit("REDIS_ERROR", err));

        this.#get = promisify(this.redisClient.get).bind(this.redisClient);

        const getMultiMixed = (string_keys: string[], hash_keys: string[]) => {
            const multi = this.redisClient.multi();
            for (const key of string_keys) {
                multi.get(key);
            }
            for (const hkey of hash_keys) {
                multi.hgetall(hkey);
            }
            return multi.exec;
        }
        this.#getMultiMixed = promisify(getMultiMixed).bind(this.redisClient);

        this.#hget = promisify(this.redisClient.hget).bind(this.redisClient);
        this.#hgetall = promisify(this.redisClient.hgetall).bind(this.redisClient);
        this.#set = promisify(this.redisClient.set).bind(this.redisClient);

        const setMultiMixed = (key: string, string_values: types.StringMap | null, hash_values: StringMapMap | null, expire?: types.UnixTimestamp) => {
            const multi = this.redisClient.multi();
            for (const subkey in string_values) {
                const elemKey = `${key}.${subkey}`;
                multi.set(elemKey, string_values[subkey]);
                if (expire) {
                    multi.expireat(elemKey, expire);
                }
            }
            for (const subkey in hash_values) {
                const elemKey = `${key}.${subkey}`;
                multi.hset(elemKey, hash_values[subkey]);
                if (expire) {
                    multi.expireat(elemKey, expire);
                }
            }
            return multi.exec;
        }
        this.#setMultiMixed = promisify(setMultiMixed).bind(this.redisClient);

        const setExpire = (key: string, value: string, expire: types.UnixTimestamp) => {
            return this.redisClient.multi().set(key, value).expireat(key, expire / 1000).exec;
        }    
        this.#setExpire = promisify(setExpire).bind(this.redisClient);
        
        this.#hset = hsetPromisify(this.redisClient.hset).bind(this.redisClient);

        const hsetExpire = (key: string, value: types.StringMap, expire: types.UnixTimestamp) => {
            return this.redisClient.multi().hset(key, value).expireat(key, expire / 1000).exec;
        }
        this.#hsetExpire = hsetExpirePromisify(hsetExpire).bind(this.redisClient);

        this.#guilds = {};
        this.#members = {};
        this.#channels = {};
    }

    get(key: string, subkey?: string | true) {
        if (subkey === true) {
            return this.#hgetall(key);
        }
        if (subkey) {
            return this.#hget(key, subkey);
        }
        return this.#get(key);
    }

    set(key: string, value: string | types.StringMap, expire?: types.UnixTimestamp) {
        if (typeof value === 'string') {
            if (expire) {
                return this.#setExpire(key, value, expire);
            }
            return this.#set(key, value);
        }
        else if (expire) {
            return this.#hsetExpire(key, value, expire);
        }
        return this.#hset(key, value);
    }

    hsetMulti(key: string, value: StringMapMap, expire?: types.UnixTimestamp) {
        if (expire) {
            return this.#setMultiMixed(key, null, value, expire);
        }
        return this.#setMultiMixed(key, null, value);
    }

    setMulti(key: string, value: types.StringMap, expire?: types.UnixTimestamp) {
        if (expire) {
            return this.#setMultiMixed(key, value, null, expire);
        }
        return this.#setMultiMixed(key, value, null);
    }

    members = {
        get: (guild_id: any, user_id: types.Snowflake): types.Member | null => {
            return this.#members[guild_id]?.[user_id] || null;
        },
        set: (guild_id: any, user_id: types.Snowflake, member: types.Member): void => {
            /*if (!this.#members[guild_id]) {
                this.#members[guild_id] = {};
            }*/
            this.#members[guild_id][user_id] = member;
        },
        setAll: (guild_id: any, member_list: MemberMap): void => {
            this.#members[guild_id] = member_list;
        },
        addChunk: (guild_id: any, member_list: MemberMap): void => {
            Object.assign(this.#members[guild_id], member_list);
        }
    }

    guilds = {
        get: (guild_id: types.Snowflake): types.Guild | null => {
            return this.#guilds[guild_id] || null;
        },
        set: (guild_id: types.Snowflake, guild: types.Guild): void => {
            this.#guilds[guild_id] = guild;
        }
    }

    users = {
        get: async (user_id: types.Snowflake): Promise<types.User | null> => {
            return this.get(user_id).then(data => this.users._deserialize(data === null ? null : data as types.UserHash));
        },
        set: async(user_id: types.Snowflake, user: types.User): Promise<void> => {
            this.set(user_id, this.users._serialize(user));
        },
        addChunk: (user_list: UserMap): void => {
            const obj: StringMapMap = {};
            for (const id in user_list) {
                obj[id] = this.users._serialize(user_list[id]);
            }
            this.hsetMulti('users', obj);
        },
        _serialize: (user: types.User): types.StringMap => {
            const obj: types.UserHash = {
                id: user.id,
                username: user.username,
                discriminator: user.discriminator.toString() as types.StringNum,
                avatar: user.avatar || 'null'
            }
            if (user.bot) obj.bot = 'true';
            if (user.system) obj.system = 'true';
            if (user.mfa_enabled) obj.mfa_enabled = 'true';
            if (user.verified) obj.verified = 'true';
            if (user.locale) obj.locale = user.locale;
            if (user.email) obj.email = user.email;
            if (user.flags) obj.flags = user.flags.toString() as types.StringNum;
            if (user.public_flags) obj.public_flags = user.public_flags.toString() as types.StringNum;
            if (user.premium_type) obj.premium_type = user.premium_type.toString() as types.StringPremiumTypes;
            return obj as types.StringMap;
        },
        _deserialize: (user_hash: types.UserHash | null) => {
            if (user_hash === null) {
                return null;
            }
            const obj: types.User = {
                id: user_hash.id,
                username: user_hash.username,
                discriminator: parseInt(user_hash.discriminator),
                avatar: user_hash.avatar === 'null' ? null : user_hash.avatar
            }
            return obj;
        }
    }

    channels = {
        get: (channel_id: types.Snowflake) => {
            return this.#channels[channel_id];
        },
        set: (channel_id: types.Snowflake, channel: types.Channel) => {
            this.#channels[channel_id] = channel;
        },
        setAll: (channel_map: ChannelMap) => {
            this.#channels = channel_map;
        }
    }

    dmChannels = {
        get: async (user_id: types.Snowflake) => {
            const cid = await this.#get(`dm_channels.${user_id}`).catch(() => null);
            return cid === null ? null : cid as types.Snowflake;
        },
        set: (user_id: types.Snowflake, dm_channel_id: types.Snowflake) => {
            this.set(`dm_channels.${user_id}`, dm_channel_id);
        },
        setAll: (dm_channel_ids: types.StringMap) => {
            this.setMulti('dm_channels', dm_channel_ids);
        }
    }

    gatewayInfo = {
        get: async () => {
            return this.#getMultiMixed(['gateway.url', 'gateway.shards'], ['gateway.session_start_limit']).then(data => {
                if (Array.isArray(data) && data.length === 3) {
                    const obj: GatewayBotInfo = {
                        url: data[0],
                        shards: data[1],
                        session_start_limit: {
                            total: parseInt(data[2].total),
                            remaining: parseInt(data[2].remaining),
                            reset_after: parseInt(data[2].reset_at) - Date.now(),
                            max_concurrency: parseInt(data[2].max_concurrency)
                        }
                    }
                    return obj;
                }
                return null;
            }).catch(() => null);
        },
        set: async (gateway_bot_info: GatewayBotInfo) => {
            const reset_at = Date.now() + gateway_bot_info.session_start_limit.reset_after;
            this.#setMultiMixed('gateway', {
                url: gateway_bot_info.url,
                shards: gateway_bot_info.shards+''
            }, {
                session_start_limit: {
                    total: gateway_bot_info.session_start_limit.total+'',
                    remaining: gateway_bot_info.session_start_limit.remaining+'',
                    reset_at: reset_at+'',
                    max_concurrency: gateway_bot_info.session_start_limit.max_concurrency+''
                }
            }, reset_at).catch(() => null);
        }
    }
}