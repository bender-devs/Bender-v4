/*
redis = global cache (used for all shards/bot versions)
- users
- user dm channel ids
- shard information (?)

local cache:
- guilds
- members
- roles
- channels
- commands (could be global but that would add too much complexity)
*/
import * as types from '../types/types';
import Bot from './bot';
import * as redis from 'redis';
import { GatewayBotInfo, GatewaySessionLimitHash, GuildMemberUpdateData, MessageUpdateData, ThreadSyncData } from '../types/gatewayTypes';
import TimeUtils from '../utils/time';

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
type CommandsMap = Record<types.Snowflake, types.Command[]>;
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

export default class CacheHandler {
    bot: Bot;
    redisClient!: redis.RedisClientType;
    gateway: types.URL | null = null;
    unavailableGuilds: types.Snowflake[];
    initialized = false;
    #guilds: CachedGuildMap;
    #dmMessages: MessageMapMap;
    #commands: types.Command[];
    #guildCommands: CommandsMap;
    #connected = false;
    #startTimestamp: number;

    constructor(bot: Bot) {
        this.bot = bot;
        this.unavailableGuilds = [];
        this.#guilds = {};
        this.#dmMessages = {};
        this.#commands = [];
        this.#guildCommands = {};
        this.#startTimestamp = Date.now();
    }

    async init() {
        this.redisClient = redis.createClient({
            socket: {
                host: process.env.REDIS_HOST,
                port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : undefined
            },
            username: process.env.REDIS_USER,
            password: process.env.REDIS_PASS
        });
        this.initialized = true;
        
        this.redisClient.on('ready', () => {
            this.#connected = true;
            const latency = TimeUtils.sinceMillis(this.#startTimestamp);
            this.bot.logger.debug('REDIS', `CONNECTED, took ${latency}ms`);
        });
        this.redisClient.on('error', err => this.bot.logger.handleError('REDIS ERROR', err));  
        this.redisClient.on('end', () => {
            this.#connected = false;
            this.bot.logger.debug('REDIS', 'DISCONNECTED!');
        });
        this.redisClient.on('reconnecting', () => {
            this.#connected = false;
            this.bot.logger.debug('REDIS', 'RECONNECTING...');
        });

        return this.redisClient.connect();
    }

    async #getMultiMixed (string_keys: string[], hash_keys: string[]) {
        const multi = this.redisClient.multi();
        for (const key of string_keys) {
            multi.get(key);
        }
        for (const hkey of hash_keys) {
            multi.hGetAll(hkey);
        }
        return multi.exec();
    }

    async #setMultiMixed(key: string, string_values: types.StringMap | null, hash_values: StringMapMap | null, expire?: types.UnixTimestamp) {
        const multi = this.redisClient.multi();
        for (const subkey in string_values) {
            const elemKey = `${key}.${subkey}`;
            multi.set(elemKey, string_values[subkey]);
            if (expire) {
                multi.expireAt(elemKey, expire);
            }
        }
        for (const subkey in hash_values) {
            const elemKey = `${key}.${subkey}`;
            multi.hSet(elemKey, hash_values[subkey]);
            if (expire) {
                multi.expireAt(elemKey, expire);
            }
        }
        return multi.exec();
    }

    async #setExpire(key: string, value: string, expire: types.UnixTimestamp) {
        return this.redisClient.multi().set(key, value).expireAt(key, expire).exec();
    }

    async #hsetExpire(key: string, value: types.StringMap, expire: types.UnixTimestamp) {
        return this.redisClient.multi().hSet(key, value).expireAt(key, expire).exec();
    }

    async #get(key: string, subkey?: string | true) {
        if (subkey === true) {
            return this.redisClient.hGetAll(key);
        }
        if (subkey) {
            return this.redisClient.hGet(key, subkey);
        }
        return this.redisClient.get(key);
    }

    async #set(key: string, value: string | types.StringMap, expire?: types.UnixTimestamp) {
        if (typeof value === 'string') {
            if (expire) {
                return this.#setExpire(key, value, expire);
            }
            return this.redisClient.set(key, value);
        }
        else if (expire) {
            return this.#hsetExpire(key, value, expire);
        }
        return this.redisClient.hSet(key, value);
    }

    async #hsetMulti(key: string, value: StringMapMap, expire?: types.UnixTimestamp) {
        if (expire) {
            return this.#setMultiMixed(key, null, value, expire);
        }
        return this.#setMultiMixed(key, null, value);
    }

    async #setMulti(key: string, value: types.StringMap, expire?: types.UnixTimestamp) {
        if (expire) {
            return this.#setMultiMixed(key, value, null, expire);
        }
        return this.#setMultiMixed(key, value, null);
    }

    async #delete(key: string) {
        return this.redisClient.del(key);
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
            if (!this.#guilds[guild.id]) {
                return; // don't cache, incomplete data
            }
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
            if (!this.#guilds[member_data.guild_id].members[member_data.user.id]) {
                return; // don't cache, incomplete data
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
        // TODO: decache members under certain circumstances?
    }

    roles = {
        get: (guild_id: types.Snowflake, role_id: types.Snowflake): types.Role | null => {
            const guild = this.guilds.get(guild_id);
            if (!guild) {
                return null;
            }
            return guild.roles[role_id] || null;
        },
        getAll: (guild_id: types.Snowflake): types.Role[] | null => {
            const guild = this.guilds.get(guild_id);
            if (!guild) {
                return null;
            }
            const roles: types.Role[] = [];
            let roleID: types.Snowflake;
            for (roleID in guild.roles) {
                roles.push(guild.roles[roleID]);
            }
            return roles.length ? roles : null;
        },
        set: (guild_id: types.Snowflake, role: types.Role): void => {
            if (!this.guilds.get(guild_id)) {
                return;
            }
            this.#guilds[guild_id].roles[role.id] = role;
        },
        setAll: (guild_id: types.Snowflake, roles: types.Role[]): void => {
            if (!this.guilds.get(guild_id)) {
                return;
            }
            this.#guilds[guild_id].roles = {};
            for (const role of roles) {
                this.#guilds[guild_id].roles[role.id] = role;
            }
        },
        update: (guild_id: types.Snowflake, role: types.Role): void => {
            if (!this.guilds.get(guild_id)) {
                return;
            }
            if (!this.#guilds[guild_id].roles[role.id]) {
                this.#guilds[guild_id].roles[role.id] = role;
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
        getAll: (guild_id: types.Snowflake): types.Emoji[] | null => {
            const guild = this.guilds.get(guild_id);
            if (!guild?.emojis) {
                return null;
            }
            const emojis: types.Emoji[] = [];
            for (const emojiID in guild.emojis) {
                emojis.push(guild.emojis[emojiID as types.Snowflake]);
            }
            return emojis.length ? emojis : null;
        },
        get: (guild_id: types.Snowflake, emoji_id: types.Snowflake): types.Emoji | null => {
            const guild = this.guilds.get(guild_id);
            if (!guild?.emojis) {
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
        },
        find: (emoji_id: types.Snowflake): types.Emoji | null => {
            let guildID: types.Snowflake;
            for (guildID in this.#guilds) {
                if (this.#guilds[guildID].emojis?.[emoji_id]) {
                    return this.#guilds[guildID].emojis[emoji_id];
                }
            }
            return null;
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
        create: (channel: types.Channel): void => {
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
            delete this.#guilds[guild_id].message_cache[channel_id];
        },
        setAll: (guild_id: types.Snowflake, channel_map: ChannelMap): void => {
            if (!this.guilds.get(guild_id)) {
                return;
            }
            this.#guilds[guild_id].channels = channel_map;
        },
        getCount: (guild_id: types.Snowflake): number => {
            if (!this.guilds.get(guild_id)) {
                return 0;
            }
            return Object.keys(this.#guilds[guild_id].channels).length;
        },
        listCategory: (guild_id: types.Snowflake, category_id: types.Snowflake): types.Channel[] | null => {
            if (!this.guilds.get(guild_id)) {
                return null;
            }
            const chans: types.Channel[] = [];
            for (const chanID in this.#guilds[guild_id].channels) {
                const chan = this.#guilds[guild_id].channels[chanID as types.Snowflake]; 
                if (chan.parent_id === category_id) {
                    chans.push(chan);
                }
            }
            return chans;
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
        create: (message: types.Message): void => {
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
            // TODO: if any of these messages are cached as command messages, delete them there too
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
        // TODO: decache older messages
    }

    threads = {
        get: (guild_id: types.Snowflake, thread_id: types.Snowflake): types.ThreadChannel | null => {
            const guild = this.guilds.get(guild_id);
            if (!guild) {
                return null;
            }
            return guild.threads[thread_id] || null;
        },
        create: (thread: types.ThreadChannel): void => {
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
            delete this.#guilds[guild_id].message_cache[thread_id];
        },
        setAll: (guild_id: types.Snowflake, thread_map: ThreadMap): void => {
            if (!this.guilds.get(guild_id)) {
                return;
            }
            this.#guilds[guild_id].threads = thread_map;
        },
        sync: (thread_sync_data: ThreadSyncData): void => {
            const guild_id = thread_sync_data.guild_id;
            if (!this.guilds.get(guild_id)) {
                return;
            }
            const oldThreadList = Object.keys(this.#guilds[guild_id].threads || {}) as types.Snowflake[];
            this.#guilds[guild_id].threads = {};
            for (const thread of thread_sync_data.threads) {
                this.#guilds[guild_id].threads[thread.id] = thread;
            }
            // for deleted threads, delete message cache
            for (const threadID of oldThreadList) {
                if (!this.#guilds[guild_id].threads[threadID]) {
                    delete this.#guilds[guild_id].message_cache[threadID];
                }
            }
        }
    }

    users = {
        get: async (user_id: types.Snowflake): Promise<types.User | null> => {
            if (!this.#connected) {
                this.bot.logger.handleError('REDIS', 'tried to call users.get() while disconnected');
                return null;
            }
            return this.#get(user_id).then(data => this.users._deserialize(data === null ? null : data as types.UserHash));
        },
        create: async(user: types.User): Promise<void> => {
            if (!this.#connected) {
                this.bot.logger.handleError('REDIS', 'tried to call users.create() while disconnected');
                return;
            }
            return this.#set(user.id, this.users._serialize(user)).then(() => undefined);
        },
        addChunk: async (user_list: UserMap): Promise<void> => {
            if (!this.#connected) {
                this.bot.logger.handleError('REDIS', 'tried to call users.addChunk() while disconnected');
                return;
            }
            const obj: StringMapMap = {};
            let id: types.Snowflake;
            for (id in user_list) {
                obj[id] = this.users._serialize(user_list[id]);
            }
            return this.#hsetMulti('users', obj).then(() => undefined);
        },
        // TODO: decache users under certain circumstances?
        _serialize: (user: types.User): types.StringMap => {
            const obj: types.UserHash = {
                id: user.id,
                username: user.username,
                discriminator: user.discriminator,
                avatar: user.avatar || 'null'
            }
            if (user.bot) {
                obj.bot = 'true';
            }
            if (user.system) {
                obj.system = 'true';
            }
            if (user.mfa_enabled) {
                obj.mfa_enabled = 'true';
            }
            if (user.verified) {
                obj.verified = 'true';
            }
            if (user.locale) {
                obj.locale = user.locale;
            }
            if (user.email) {
                obj.email = user.email;
            }
            if (user.flags) {
                obj.flags = user.flags.toString() as types.StringNum;
            }
            if (user.public_flags) {
                obj.public_flags = user.public_flags.toString() as types.StringNum;
            }
            if (user.premium_type) {
                obj.premium_type = user.premium_type.toString() as types.StringPremiumTypes;
            }
            return obj as types.StringMap;
        },
        _deserialize: (user_hash: types.UserHash | null): types.User | null => {
            if (user_hash === null) {
                return null;
            }
            const obj: types.User = {
                id: user_hash.id,
                username: user_hash.username,
                discriminator: user_hash.discriminator,
                avatar: user_hash.avatar === 'null' ? null : user_hash.avatar
            }
            return obj;
        }
    }

    dmChannels = {
        get: async (user_id: types.Snowflake): Promise<types.Snowflake | null> => {
            if (!this.#connected) {
                this.bot.logger.handleError('REDIS', 'tried to call dmChannels.get() while disconnected');
                return null;
            }
            const cid = await this.redisClient.get(`dm_channels.${user_id}`).catch(() => undefined);
            return cid === null ? null : cid as types.Snowflake;
        },
        set: async (user_id: types.Snowflake, dm_channel_id: types.Snowflake): Promise<void> => {
            if (!this.#connected) {
                this.bot.logger.handleError('REDIS', 'tried to call dmChannels.set() while disconnected');
                return;
            }
            return this.#set(`dm_channels.${user_id}`, dm_channel_id).then(() => undefined);
        },
        setAll: async (dm_channel_ids: types.StringMap): Promise<void> => {
            if (!this.#connected) {
                this.bot.logger.handleError('REDIS', 'tried to call dmChannels.setAll() while disconnected');
                return;
            }
            return this.#setMulti('dm_channels', dm_channel_ids).then(() => undefined);
        },
        delete: async (user_id: types.Snowflake): Promise<void> => {
            if (!this.#connected) {
                this.bot.logger.handleError('REDIS', 'tried to call dmChannels.delete() while disconnected');
                return;
            }
            return this.#delete(`dm_channels.${user_id}`).then(() => undefined);
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
        create: (message: types.Message): void => {
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
            if (!this.#connected) {
                this.bot.logger.handleError('REDIS', 'tried to call gatewayInfo.get() while disconnected');
                return null;
            }
            return this.#getMultiMixed(['gateway.url', 'gateway.shards'], ['gateway.session_start_limit']).then(data => {
                if (!Array.isArray(data) || data.length !== 3 || typeof data[0] !== 'string' && typeof data[1] !== 'string') {
                    return null;
                }
                let sessionLimitData: GatewaySessionLimitHash | null = null;
                if (data[2] && typeof data[2] === 'object' && 'max_concurrency' in data[2]) {
                    sessionLimitData = data[2] as GatewaySessionLimitHash;
                }
                if (!sessionLimitData) {
                    return null;
                }
                const obj: GatewayBotInfo = {
                    url: data[0] as types.URL,
                    shards: parseInt(data[1] as string),
                    session_start_limit: {
                        total: parseInt(sessionLimitData.total),
                        remaining: parseInt(sessionLimitData.remaining),
                        reset_after: parseInt(sessionLimitData.reset_at) - Date.now(),
                        max_concurrency: parseInt(sessionLimitData.max_concurrency)
                    }
                }
                if (obj.session_start_limit.reset_after <= 0) {
                    return null;
                }
                return obj;
            }).catch(() => null);
        },
        set: async (gateway_bot_info: GatewayBotInfo): Promise<void> => {
            if (!this.#connected) {
                this.bot.logger.handleError('REDIS', 'tried to call gatewayInfo.set() while disconnected');
                return;
            }
            const reset_at = Math.floor((Date.now() + gateway_bot_info.session_start_limit.reset_after) / 1000);
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
            }, reset_at).then(() => undefined).catch(() => undefined);
        }
    }

    globalCommands = {
        getAll: () => {
            return this.#commands?.length ? this.#commands : null;
        },
        get: (id: types.Snowflake) => {
            return this.#commands.find(cmd => cmd.id === id) || null;
        },
        findByName: (name: string) => {
            return this.#commands.find(cmd => cmd.name === name) || null;
        },
        setAll: (commands: types.Command[]) => {
            this.#commands = commands;
        },
        update: (command: types.Command) => {
            const cmd = this.globalCommands.get(command.id);
            if (cmd) {
                this.globalCommands._splice(cmd, command);
            } else {
                this.#commands.push(command);
            }
        },
        delete: (id: types.Snowflake) => {
            const cmd = this.globalCommands.get(id);
            if (cmd) {
                this.globalCommands._splice(cmd);
            }
        },
        deleteByName: (name: string) => {
            const cmd = this.globalCommands.findByName(name);
            if (cmd) {
                this.globalCommands._splice(cmd);
            }
        },
        _splice: (cmd: types.Command, newCmd?: types.Command) => {
            const index = this.#commands.indexOf(cmd);
            if (newCmd) {
                this.#commands.splice(index, 1, newCmd);
            } else {
                this.#commands.splice(index, 1);
            }
        }
    }

    guildCommands = {
        getAll: (guild_id: types.Snowflake) => {
            return guild_id in this.#guildCommands ? this.#guildCommands[guild_id] : null;
        },
        get: (guild_id: types.Snowflake, id: types.Snowflake) => {
            const commands = this.guildCommands.getAll(guild_id);
            return commands?.find(cmd => cmd.id === id) || null;
        },
        findByName: (guild_id: types.Snowflake, name: string) => {
            const commands = this.guildCommands.getAll(guild_id);
            return commands?.find(cmd => cmd.name === name) || null;
        },
        setAll: (guild_id: types.Snowflake, commands: types.Command[]) => {
            this.#guildCommands[guild_id] = commands;
        },
        update: (guild_id: types.Snowflake, command: types.Command) => {
            const cmd = this.guildCommands.get(guild_id, command.id);
            if (cmd) {
                this.guildCommands._splice(guild_id, cmd, command);
            } else if (this.#guildCommands[guild_id]) {
                this.#guildCommands[guild_id].push(command);
            } else {
                this.#guildCommands[guild_id] = [command];
            }
        },
        delete: (guild_id: types.Snowflake, id: types.Snowflake) => {
            const cmd = this.guildCommands.get(guild_id, id);
            if (cmd) {
                this.guildCommands._splice(guild_id, cmd);
            }
        },
        deleteByName: (guild_id: types.Snowflake, name: string) => {
            const cmd = this.guildCommands.findByName(guild_id, name);
            if (cmd) {
                this.guildCommands._splice(guild_id, cmd);
            }
        },
        _splice: (guild_id: types.Snowflake, cmd: types.Command, newCmd?: types.Command) => {
            const index = this.#guildCommands[guild_id].indexOf(cmd);
            if (newCmd) {
                this.#guildCommands[guild_id].splice(index, 1, newCmd);
            } else {
                this.#guildCommands[guild_id].splice(index, 1);
            }
        }
    }
}