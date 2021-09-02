/*
redis = global cache (used for all shards/bot versions)
- users
- user dm channel ids
- shard information (?)

localized cache:
- guilds
- members
- roles
- channels
- commands (could be global but that would add too much complexity)
*/
import * as types from "../data/types";
import Bot from "../structures/bot";
import { promisify } from "util";
import * as redis from 'redis';
import { GatewayBotInfo, GuildMemberUpdateData, MessageUpdateData } from "../data/gatewayTypes";

type ChannelMap = Record<types.Snowflake, types.Channel>;
type ThreadMap = Record<types.Snowflake, types.ThreadChannel>;
type MemberMap = Record<types.Snowflake, types.Member>;
type PresenceMap = Record<types.Snowflake, types.Presence>;
type VoiceStateMap = Record<types.Snowflake, types.VoiceState>;
type StageInstanceMap = Record<types.Snowflake, types.StageInstance>;
export type RoleMap = Record<types.Snowflake, types.Role>;
export type EmojiMap = Record<types.Snowflake, types.Emoji>;
type CachedGuildMap = Record<types.Snowflake, CachedGuild>;
type UserMap = Record<types.Snowflake, types.User>;
type MessageMap = Record<types.Snowflake, types.Message>;
type MessageMapMap = Record<types.Snowflake, MessageMap>;
type StringMapMap = Record<string, types.StringMap>;

type GatewayGuildOmit = Omit<types.GatewayGuildBase, 'roles' | 'emojis'>;
export interface CachedGuild extends GatewayGuildOmit {
    voice_states: VoiceStateMap;
    members: MemberMap;
    channels: ChannelMap;
    threads: ThreadMap;
    presences: PresenceMap;
    stage_instances: StageInstanceMap;
    roles: RoleMap;
    emojis: EmojiMap;
    message_cache: MessageMapMap;
}

// doing these tricks because promisify() doesn't choose the correct overload
type hsetType = (key: string, fields: types.StringMap, callback: redis.Callback<number>) => boolean;
const hsetPromisify = (command: hsetType) => promisify(command);
type hsetExpireType = (key: string, fields: types.StringMap, expire: types.UnixTimestampMillis) => (callback: redis.Callback<any[]>) => boolean;
const hsetExpirePromisify = (command: hsetExpireType) => promisify(command);

export default class CacheHandler {
    bot: Bot;
    redisClient: redis.RedisClient;
    gateway: types.URL | null = null;
    unavailableGuilds: types.Snowflake[];
    #guilds: CachedGuildMap;
    #dmMessages: MessageMapMap;

    #get: (key: string) => Promise<string | null>;
    #getMultiMixed: (string_keys: string[], hash_keys: string[]) => Promise<unknown>;
    #hget: (key: string, field: string) => Promise<string | null>;
    #hgetall: (key: string) => Promise<types.StringMap | null>;
    #set: (key: string, value: string) => Promise<unknown>;
    #setExpire: (key: string, value: string, expire: types.UnixTimestampMillis) => Promise<unknown>;
    #setMultiMixed: (key: string, top_level_values: types.StringMap | null, values: StringMapMap | null, expire?: types.UnixTimestampMillis) => Promise<unknown>;
    #hset: (key: string, fields: types.StringMap) => Promise<unknown>;
    #hsetExpire: (key: string, value: types.StringMap, expire: types.UnixTimestampMillis) => Promise<unknown>;

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

        const setMultiMixed = (key: string, string_values: types.StringMap | null, hash_values: StringMapMap | null, expire?: types.UnixTimestampMillis) => {
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

        const setExpire = (key: string, value: string, expire: types.UnixTimestampMillis) => {
            return this.redisClient.multi().set(key, value).expireat(key, expire / 1000).exec;
        }    
        this.#setExpire = promisify(setExpire).bind(this.redisClient);
        
        this.#hset = hsetPromisify(this.redisClient.hset).bind(this.redisClient);

        const hsetExpire = (key: string, value: types.StringMap, expire: types.UnixTimestampMillis) => {
            return this.redisClient.multi().hset(key, value).expireat(key, expire / 1000).exec;
        }
        this.#hsetExpire = hsetExpirePromisify(hsetExpire).bind(this.redisClient);

        this.unavailableGuilds = [];
        this.#guilds = {};
        this.#dmMessages = {};
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

    set(key: string, value: string | types.StringMap, expire?: types.UnixTimestampMillis) {
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

    hsetMulti(key: string, value: StringMapMap, expire?: types.UnixTimestampMillis) {
        if (expire) {
            return this.#setMultiMixed(key, null, value, expire);
        }
        return this.#setMultiMixed(key, null, value);
    }

    setMulti(key: string, value: types.StringMap, expire?: types.UnixTimestampMillis) {
        if (expire) {
            return this.#setMultiMixed(key, value, null, expire);
        }
        return this.#setMultiMixed(key, value, null);
    }

    

    guilds = {
        get: (guild_id: types.Snowflake): CachedGuild | null => {
            return this.#guilds[guild_id] || null;
        },
        create: (guild: types.GatewayGuild): void => {
            const channels: ChannelMap = {};
            for (const channel of guild.channels) {
                channels[channel.id] = channel;
            }
            const threads: ThreadMap = {};
            for (const thread of guild.threads) {
                threads[thread.id] = thread;
            }
            const members: MemberMap = {};
            for (const member of guild.members) {
                members[member.user.id] = member;
            }
            const presences: PresenceMap = {};
            for (const presence of guild.presences) {
                presences[presence.user.id] = presence;
            }
            const roles: RoleMap = {};
            for (const role of guild.roles) {
                roles[role.id] = role;
            }
            const emojis: EmojiMap = {};
            for (const emoji of guild.emojis) {
                emojis[emoji.id] = emoji;
            }
            const voiceStates: VoiceStateMap = {};
            for (const voiceState of guild.voice_states) {
                voiceStates[voiceState.user_id] = voiceState;
            }
            const stageInstances: StageInstanceMap = {};
            for (const stageInstance of guild.stage_instances) {
                stageInstances[stageInstance.id] = stageInstance;
            }
            const newGuild: CachedGuild = Object.assign({}, guild, {
                channels, threads, members, presences, roles, emojis, voice_states: voiceStates, stage_instances: stageInstances, message_cache: {}
            });
            this.#guilds[guild.id] = newGuild;
        },
        update: (guild: types.Guild): void => {
            Object.assign(this.#guilds[guild.id], guild);
        },
        delete: (guild_id: types.Snowflake): void => {
            delete this.#guilds[guild_id];
        }
    }

    members = {
        get: (guild_id: types.Snowflake, user_id: types.Snowflake): types.Member | null => {
            const guild = this.guilds.get(guild_id);
            if (!guild) {
                return null;
            }
            return guild.members[user_id] || null;
        },
        set: (guild_id: types.Snowflake, member: types.Member): void => {
            if (!this.guilds.get(guild_id)) {
                return;
            }
            this.#guilds[guild_id].members[member.user.id] = member;
        },
        update: (member_data: GuildMemberUpdateData): void => {
            if (!this.guilds.get(member_data.guild_id)) {
                return;
            }
            Object.assign(this.#guilds[member_data.guild_id].members[member_data.user.id], member_data);
        },
        delete: (guild_id: types.Snowflake, user_id: types.Snowflake): void => {
            if (!this.guilds.get(guild_id)) {
                return;
            }
            delete this.#guilds[guild_id].members[user_id];
        },
        setAll: (guild_id: types.Snowflake, member_list: MemberMap): void => {
            this.#guilds[guild_id].members = member_list;
        },
        addChunk: (guild_id: types.Snowflake, members: types.Member[]): void => {
            const memberMap: MemberMap = {};
            for (const member of members) {
                memberMap[member.user.id] = member;
            }
            Object.assign(this.#guilds[guild_id].members, memberMap);
        }
    }

    roles = {
        get: (guild_id: types.Snowflake, role_id: types.Snowflake): types.Role | null => {
            const guild = this.guilds.get(guild_id);
            if (!guild) {
                return null;
            }
            return guild.roles[role_id] || null;
        },
        set: (guild_id: types.Snowflake, role: types.Role): void => {
            if (!this.guilds.get(guild_id)) {
                return;
            }
            this.#guilds[guild_id].roles[role.id] = role;
        },
        update: (guild_id: types.Snowflake, role: types.Role): void => {
            if (!this.guilds.get(guild_id)) {
                return;
            }
            Object.assign(this.#guilds[guild_id].roles[role.id], role);
        },
        delete: (guild_id: types.Snowflake, role_id: types.Snowflake): void => {
            if (!this.guilds.get(guild_id)) {
                return;
            }
            delete this.#guilds[guild_id].roles[role_id];
        }
    }

    emojis = {
        get: (guild_id: types.Snowflake, emoji_id: types.Snowflake): types.Emoji | null => {
            const guild = this.guilds.get(guild_id);
            if (!guild) {
                return null;
            }
            return guild.emojis[emoji_id] || null;
        },
        set: (guild_id: types.Snowflake, emoji: types.Emoji): void => {
            if (!this.guilds.get(guild_id)) {
                return;
            }
            this.#guilds[guild_id].emojis[emoji.id] = emoji;
        },
        setAll: (guild_id: types.Snowflake, emojis: types.Emoji[]): void => {
            if (!this.guilds.get(guild_id)) {
                return;
            }
            const emojiMap: EmojiMap = {};
            for (const emoji of emojis) {
                emojiMap[emoji.id] = emoji;
            }
            this.#guilds[guild_id].emojis = emojiMap;
        },
        delete: (guild_id: types.Snowflake, emoji_id: types.Snowflake): void => {
            if (!this.guilds.get(guild_id)) {
                return;
            }
            delete this.#guilds[guild_id].emojis[emoji_id];
        }
    }

    channels = {
        get: (guild_id: types.Snowflake, channel_id: types.Snowflake): types.Channel | null => {
            const guild = this.guilds.get(guild_id);
            if (!guild) {
                return null;
            }
            return guild.channels[channel_id] || null;
        },
        set: (channel: types.Channel): void => {
            if (!channel.guild_id) {
                return; // ignore dm channels
            }
            if (!this.guilds.get(channel.guild_id)) {
                return;
            }
            this.#guilds[channel.guild_id].channels[channel.id] = channel;
        },
        delete: (guild_id: types.Snowflake, channel_id: types.Snowflake): void => {
            if (!this.guilds.get(guild_id)) {
                return;
            }
            delete this.#guilds[guild_id].channels[channel_id];
        },
        setAll: (guild_id: types.Snowflake, channel_map: ChannelMap): void => {
            if (!this.guilds.get(guild_id)) {
                return;
            }
            this.#guilds[guild_id].channels = channel_map;
        }
    }

    messages = {
        get: (guild_id: types.Snowflake, channel_id: types.Snowflake, message_id: types.Snowflake): types.Message | null => {
            const guild = this.guilds.get(guild_id);
            if (!guild) {
                return null;
            }
            if (!guild.message_cache[channel_id]) {
                return null;
            }
            return guild.message_cache[channel_id][message_id] || null;
        },
        set: (message: types.Message): void => {
            if (!message.guild_id) {
                return; // ignore dm messages
            }
            const guild = this.guilds.get(message.guild_id);
            if (!guild) {
                return;
            }
            if (!guild.message_cache[message.channel_id]) {
                this.#guilds[message.guild_id].message_cache[message.channel_id] = {};
            }
            this.#guilds[message.guild_id].message_cache[message.channel_id][message.id] = message;
        },
        update: (message: MessageUpdateData): void => {
            if (!message.guild_id) {
                return; // ignore dm messages
            }
            const guild = this.guilds.get(message.guild_id);
            if (!guild?.message_cache[message.channel_id]?.[message.id]) {
                return;
            }
            Object.assign(this.#guilds[message.guild_id].message_cache[message.channel_id][message.id], message);
        },
        delete: (guild_id: types.Snowflake, channel_id: types.Snowflake, message_id: types.Snowflake): void => {
            const guild = this.guilds.get(guild_id);
            if (!guild) {
                return;
            }
            if (!guild.message_cache[channel_id]) {
                return;
            }
            delete this.#guilds[guild_id].message_cache[channel_id][message_id];
        },
        deleteChunk: (guild_id: types.Snowflake, channel_id: types.Snowflake, message_ids: types.Snowflake[]): void => {
            const guild = this.guilds.get(guild_id);
            if (!guild) {
                return;
            }
            if (!guild.message_cache[channel_id]) {
                return;
            }
            for (const messageID of message_ids) {
                delete this.#guilds[guild_id].message_cache[channel_id][messageID];
            }
        },
        addChunk: (guild_id: types.Snowflake, channel_id: types.Snowflake, message_map: MessageMap): void => {
            const guild = this.guilds.get(guild_id);
            if (!guild) {
                return;
            }
            if (!guild.message_cache[channel_id]) {
                this.#guilds[guild_id].message_cache[channel_id] = {};
            }
            Object.assign(this.#guilds[guild_id].message_cache[channel_id], message_map);
        }
    }

    threads = {
        get: (guild_id: types.Snowflake, thread_id: types.Snowflake): types.ThreadChannel | null => {
            const guild = this.guilds.get(guild_id);
            if (!guild) {
                return null;
            }
            return guild.threads[thread_id] || null;
        },
        set: (thread: types.ThreadChannel): void => {
            if (!this.guilds.get(thread.guild_id)) {
                return;
            }
            this.#guilds[thread.guild_id].threads[thread.id] = thread;
        },
        delete: (guild_id: types.Snowflake, thread_id: types.Snowflake): void => {
            if (!this.guilds.get(guild_id)) {
                return;
            }
            delete this.#guilds[guild_id].threads[thread_id];
        },
        setAll: (guild_id: types.Snowflake, thread_map: ThreadMap): void => {
            if (!this.guilds.get(guild_id)) {
                return;
            }
            this.#guilds[guild_id].threads = thread_map;
        }
    }

    users = {
        get: async (user_id: types.Snowflake): Promise<types.User | null> => {
            return this.get(user_id).then(data => this.users._deserialize(data === null ? null : data as types.UserHash));
        },
        set: async(user_id: types.Snowflake, user: types.User): Promise<void> => {
            return this.set(user_id, this.users._serialize(user)).then(() => {});
        },
        addChunk: async (user_list: UserMap): Promise<void> => {
            const obj: StringMapMap = {};
            let id: types.Snowflake;
            for (id in user_list) {
                obj[id] = this.users._serialize(user_list[id]);
            }
            return this.hsetMulti('users', obj).then(() => {});
        },
        // TODO: decache users under certain circumstances?
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
        _deserialize: (user_hash: types.UserHash | null): types.User | null => {
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

    dmChannels = {
        get: async (user_id: types.Snowflake): Promise<types.Snowflake | null> => {
            const cid = await this.#get(`dm_channels.${user_id}`).catch(() => null);
            return cid === null ? null : cid as types.Snowflake;
        },
        set: async (user_id: types.Snowflake, dm_channel_id: types.Snowflake): Promise<void> => {
            return this.set(`dm_channels.${user_id}`, dm_channel_id).then(() => {});
        },
        setAll: async (dm_channel_ids: types.StringMap): Promise<void> => {
            return this.setMulti('dm_channels', dm_channel_ids).then(() => {});
        }
        // TODO: decache dm channel when associated user is decached?
    }

    dmMessages = {
        get: (channel_id: types.Snowflake, message_id: types.Snowflake): types.Message | null => {
            if (!this.#dmMessages[channel_id]) {
                return null;
            }
            return this.#dmMessages[channel_id][message_id] || null;
        },
        set: (message: types.Message): void => {
            if (message.guild_id) {
                return; // ignore guild messages
            }
            this.dmChannels.get(message.author.id).then(channel_id => {
                if (!channel_id) {
                    this.dmChannels.set(message.author.id, message.channel_id);
                }
            })
            if (!this.#dmMessages[message.channel_id]) {
                this.#dmMessages[message.channel_id] = {};
            }
            this.#dmMessages[message.channel_id][message.id] = message;
        },
        update: (message: MessageUpdateData): void => {
            if (message.guild_id) {
                return; // ignore guild messages
            }
            if (!this.#dmMessages[message.channel_id]?.[message.id]) {
                return;
            }
            Object.assign(this.#dmMessages[message.channel_id][message.id], message);
        },
        delete: (channel_id: types.Snowflake, message_id: types.Snowflake): void => {
            if (!this.#dmMessages[channel_id]) {
                return;
            }
            delete this.#dmMessages[channel_id][message_id];
        },
        deleteChunk: (channel_id: types.Snowflake, message_ids: types.Snowflake[]): void => {
            if (!this.#dmMessages[channel_id]) {
                return;
            }
            for (const messageID of message_ids) {
                delete this.#dmMessages[channel_id][messageID];
            }
        }
    }

    gatewayInfo = {
        get: async (): Promise<GatewayBotInfo | null> => {
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
        set: async (gateway_bot_info: GatewayBotInfo): Promise<void> => {
            const reset_at = Date.now() + gateway_bot_info.session_start_limit.reset_after;
            return this.#setMultiMixed('gateway', {
                url: gateway_bot_info.url,
                shards: gateway_bot_info.shards+''
            }, {
                session_start_limit: {
                    total: gateway_bot_info.session_start_limit.total+'',
                    remaining: gateway_bot_info.session_start_limit.remaining+'',
                    reset_at: reset_at+'',
                    max_concurrency: gateway_bot_info.session_start_limit.max_concurrency+''
                }
            }, reset_at).then(() => {}).catch(() => {});
        }
    }
}