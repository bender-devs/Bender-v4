
import * as num from './numberTypes.js';
import events from './eventTypes.js';
import * as types from './types.js';

/************ gateway errors ************/

export const enum ERRORS {
    PAYLOAD_SENT_BEFORE_WS = 'Tried to send data before the WebSocket was established.',
    PAYLOAD_SENT_BEFORE_CONNECT = 'Tried to send data before the WebSocket was connected.'
}

export interface GatewayError extends Error {
    name: ERRORS;
    message: ERRORS;
}

/************ gateway payload types ************/

export type GatewayParams = {
    v: num.GATEWAY_VERSIONS;
    encoding: 'json' | 'etf';
    compress?: 'zlib-stream';
}

export type GatewayPayload = {
    op: num.GATEWAY_OPCODES;
    d: GatewayData;
    s: SequenceNumber;
    t: EventName | null;
}

export type SequenceNumber = number | null;

/********* events *********/

export type EventName = typeof events[number];
export type LowercaseEventName = Lowercase<EventName>;
export const LowercaseEventNames = events.map(name => name.toLowerCase());

export interface EventPayload extends GatewayPayload {
    op: num.GATEWAY_OPCODES.DISPATCH;
    d: EventData;
    s: number;
    t: EventName;
}
export type EventData = ReadyData | ResumedData | ChannelUpdateData | ChannelPinsUpdateData | ThreadSyncData | ThreadMemberUpdateData | ThreadMembersUpdateData | GuildCreateData | GuildUpdateData | GuildDeleteData | GuildBanEventData | GuildEmojisUpdateData | GuildIntegrationsUpdateData | GuildMemberAddData | GuildMemberRemoveData | GuildMemberUpdateData | GuildMembersChunkData | GuildRoleDeleteData | GuildRoleUpdateData | IntegrationDeleteData | IntegrationUpdateData | InviteCreateData | InviteDeleteData | MessageCreateData | MessageDeleteBulkData | MessageDeleteData | MessageUpdateData | ReactionAddData | ReactionRemoveAllData | ReactionRemoveData | ReactionRemoveEmojiData | PresenceUpdateData | TypingStartData | UserUpdateData | VoiceServerUpdateData | VoiceStateUpdateData | WebhooksUpdateData | CommandUpdateData | CommandPermissionsUpdateData | InteractionCreateData | StageInstanceUpdateData | AutoModUpdateData | AutoModExecuteData;

/****** ready ******/

export interface ReadyPayload extends EventPayload {
    t: 'READY';
    d: ReadyData;
}

export type ReadyData = {
    v: num.GATEWAY_VERSIONS;
    user: types.User;
    guilds: types.UnavailableGuild[];
    session_id: string;
    shard?: ShardConnectionData;
    application: types.PartialApplication;
}

export interface ResumedPayload extends EventPayload {
    t: 'RESUMED';
    d: ResumedData;
}

export type ResumedData = null;

/****** channels/threads ******/

export interface ChannelEventPayload extends EventPayload {
    t: 'CHANNEL_CREATE' | 'CHANNEL_UPDATE' | 'CHANNEL_DELETE';
    d: ChannelUpdateData;
}

export type ChannelUpdateData = types.Channel;

export interface ChannelPinsUpdatePayload extends EventPayload {
    t: 'CHANNEL_PINS_UPDATE';
    d: ChannelPinsUpdateData;
}

export type ChannelPinsUpdateData = {
    guild_id?: types.Snowflake;
    channel_id: types.Snowflake;
    last_pin_timestamp?: types.Timestamp | null;
}

export interface ThreadEventPayload extends EventPayload {
    t: 'THREAD_CREATE' | 'THREAD_UPDATE' | 'THREAD_DELETE';
    d: ThreadUpdateData;
}

export type ThreadUpdateData = types.ThreadChannel;

export interface ThreadSyncPayload extends EventPayload {
    t: 'THREAD_LIST_SYNC';
    d: ThreadSyncData;
}

export type ThreadSyncData = {
    guild_id: types.Snowflake;
    channel_ids?: types.Snowflake[];
    threads: types.ThreadChannel[];
    members: types.ThreadMember[];
}

export interface ThreadMemberUpdatePayload extends EventPayload {
    t: 'THREAD_MEMBER_UPDATE';
    d: ThreadMemberUpdateData;
}

export type ThreadMemberUpdateData = types.ThreadMember;

export interface ThreadMembersUpdatePayload extends EventPayload {
    t: 'THREAD_MEMBERS_UPDATE';
    d: ThreadMembersUpdateData;
}

export type ThreadMembersUpdateData = {
    id: types.Snowflake;
    guild_id: types.Snowflake;
    member_count: number;
    added_members?: types.ThreadMember[];
    removed_member_ids?: types.Snowflake[];
}

/****** guilds ******/

export interface GuildCreatePayload extends EventPayload {
    t: 'GUILD_CREATE';
    d: GuildCreateData;
}

export type GuildCreateData = types.GatewayGuild;

export interface GuildUpdatePayload extends EventPayload {
    t: 'GUILD_UPDATE';
    d: GuildUpdateData;
}

export type GuildUpdateData = types.Guild;

export interface GuildDeletePayload extends EventPayload {
    t: 'GUILD_DELETE';
    d: GuildDeleteData;
}

export type GuildDeleteData = types.UnavailableGuild;

export interface GuildBanEventPayload extends EventPayload {
    t: 'GUILD_BAN_ADD' | 'GUILD_BAN_REMOVE';
    d: GuildBanEventData;
}

export type GuildBanEventData = {
    guild_id: types.Snowflake;
    user: types.User;
}

export interface GuildEmojisUpdatePayload extends EventPayload {
    t: 'GUILD_EMOJIS_UPDATE';
    d: GuildEmojisUpdateData;
}

export type GuildEmojisUpdateData = {
    guild_id: types.Snowflake;
    emojis: types.Emoji[];
}

export interface GuildStickersUpdatePayload extends EventPayload {
    t: 'GUILD_STICKERS_UPDATE';
    d: GuildStickersUpdateData;
}

export type GuildStickersUpdateData = {
    guild_id: types.Snowflake;
    stickers: types.Sticker[];
}

export interface GuildIntegrationsUpdatePayload extends EventPayload {
    t: 'GUILD_INTEGRATIONS_UPDATE';
    d: GuildIntegrationsUpdateData;
}

export type GuildIntegrationsUpdateData = {
    guild_id: types.Snowflake;
}

export interface GuildMemberAddPayload extends EventPayload {
    t: 'GUILD_MEMBER_ADD';
    d: GuildMemberAddData;
}

export interface GuildMemberAddData extends types.Member {
    guild_id: types.Snowflake;
}

export interface GuildMemberRemovePayload extends EventPayload {
    t: 'GUILD_MEMBER_REMOVE';
    d: GuildMemberRemoveData;
}

export interface GuildMemberRemoveData extends types.Member {
    guild_id: types.Snowflake;
    user: types.User;
}

export interface GuildMemberUpdatePayload extends EventPayload {
    t: 'GUILD_MEMBER_UPDATE';
    d: GuildMemberUpdateData;
}

export interface GuildMemberUpdateData extends types.MemberData {
    guild_id: types.Snowflake;
    roles: types.Snowflake[];
    user: types.User;
    joined_at: types.Timestamp | null;
    premium_since?: types.Timestamp | null;
    pending?: boolean;
    communication_disabled_until?: types.Timestamp | null;
    avatar?: string | null;
}

export interface GuildMembersChunkPayload extends EventPayload {
    t: 'GUILD_MEMBERS_CHUNK';
    d: GuildMembersChunkData;
}

export type GuildMembersChunkData = {
    guild_id: types.Snowflake;
    members: types.Member[];
    chunk_index: number;
    chunk_count: number;
    not_found?: types.Snowflake[];
    presences?: types.Presence[];
    nonce?: string;
}

export interface GuildRoleUpdatePayload extends EventPayload {
    t: 'GUILD_ROLE_CREATE' | 'GUILD_ROLE_UPDATE';
    d: GuildRoleUpdateData;
}

export type GuildRoleUpdateData = {
    guild_id: types.Snowflake;
    role: types.Role;
}

export interface GuildRoleDeletePayload extends EventPayload {
    t: 'GUILD_ROLE_DELETE';
    d: GuildRoleUpdateData;
}

export type GuildRoleDeleteData = {
    guild_id: types.Snowflake;
    role_id: types.Snowflake;
}

export type GuildScheduledEventUpdateData = types.GuildScheduledEvent;
export type GuildScheduledEventUserUpdateData = types.GuildScheduledEvent;

/****** integrations ******/

export interface IntegrationUpdatePayload extends EventPayload {
    t: 'INTEGRATION_CREATE' | 'INTEGRATION_UPDATE';
    d: IntegrationUpdateData;
}

export interface IntegrationUpdateData extends types.Integration {
    guild_id: types.Snowflake;
}

export interface IntegrationDeletePayload extends EventPayload {
    t: 'INTEGRATION_DELETE';
    d: IntegrationDeleteData;
}

export type IntegrationDeleteData = {
    id: types.Snowflake
    guild_id: types.Snowflake;
    application_id?: types.Snowflake;
}

/****** invites ******/

export interface InviteCreatePayload extends EventPayload {
    t: 'INVITE_CREATE';
    d: InviteCreateData;
}

export type InviteCreateData = {
    channel_id: types.Snowflake;
    code: string;
    created_at: types.Timestamp;
    guild_id?: types.Snowflake;
    inviter?: types.User;
    max_age: number;
    max_uses: number;
    target_type?: number;
    target_user?: types.User;
    target_application?: types.PartialApplication;
    temporary: boolean;
    uses: number;
}

export interface InviteDeletePayload extends EventPayload {
    t: 'INVITE_DELETE';
    d: InviteDeleteData;
}

export type InviteDeleteData = Pick<InviteCreateData, 'channel_id' | 'code' | 'guild_id'>;

/****** messages ******/

export interface MessageCreatePayload extends EventPayload {
    t: 'MESSAGE_CREATE';
    d: MessageCreateData;
}

export interface MessageCreateData extends types.Message {
    member?: types.PartialMember;
}

export interface MessageUpdatePayload extends EventPayload {
    t: 'MESSAGE_UPDATE';
    d: MessageUpdateData;
}

export interface MessageUpdateData extends Partial<MessageCreateData> {
    id: types.Snowflake;
    channel_id: types.Snowflake;
}

export interface MessageDeletePayload extends EventPayload {
    t: 'MESSAGE_DELETE';
    d: MessageDeleteData;
}

export type MessageDeleteData = Pick<MessageUpdateData, 'id' | 'channel_id' | 'guild_id'>;

export interface MessageDeleteBulkPayload extends EventPayload {
    t: 'MESSAGE_DELETE_BULK';
    d: MessageDeleteBulkData;
}

export interface MessageDeleteBulkData extends Pick<types.Message, 'channel_id' | 'guild_id'> {
    ids: types.Snowflake[];
}

/****** reactions ******/

export interface ReactionAddPayload extends EventPayload {
    t: 'MESSAGE_REACTION_ADD';
    d: ReactionAddData;
}

export type ReactionAddData = {
    user_id: types.Snowflake;
    channel_id: types.Snowflake;
    message_id: types.Snowflake;
    guild_id?: types.Snowflake;
    member?: types.Member;
    emoji: types.Emoji;
}

export interface ReactionRemovePayload extends EventPayload {
    t: 'MESSAGE_REACTION_REMOVE';
    d: ReactionRemoveData;
}

export type ReactionRemoveData = Omit<ReactionAddData, 'member'>;

export interface ReactionRemoveAllPayload extends EventPayload {
    t: 'MESSAGE_REACTION_REMOVE_ALL';
    d: ReactionRemoveAllData;
}

export type ReactionRemoveAllData = Pick<ReactionAddData, 'channel_id' | 'message_id' | 'guild_id'>;

export interface ReactionRemoveEmojiPayload extends EventPayload {
    t: 'MESSAGE_REACTION_REMOVE_EMOJI';
    d: ReactionRemoveEmojiData;
}

export type ReactionRemoveEmojiData = Omit<ReactionRemoveData, 'user_id'>;

/****** presences ******/

export interface PresenceUpdatePayload extends EventPayload {
    t: 'PRESENCE_UPDATE';
    d: PresenceUpdateData;
}

export type PresenceUpdateData = types.Presence;

/****** typing ******/

export interface TypingStartPayload extends EventPayload {
    t: 'TYPING_START';
    d: TypingStartData;
}

export type TypingStartData = {
    channel_id: types.Snowflake;
    guild_id?: types.Snowflake;
    user_id: types.Snowflake;
    timestamp: types.UnixTimestampMillis;
    member?: types.Member;
}

/****** users ******/

export interface UserUpdatePayload extends EventPayload {
    t: 'USER_UPDATE';
    d: UserUpdateData;
}

export type UserUpdateData = types.User;

/****** voice ******/

export interface VoiceStateUpdatePayload extends EventPayload {
    t: 'VOICE_STATE_UPDATE';
    d: VoiceStateUpdateData;
}

export type VoiceStateUpdateData = types.VoiceState;

export interface VoiceServerUpdatePayload extends EventPayload {
    t: 'VOICE_SERVER_UPDATE';
    d: VoiceServerUpdateData;
}

export type VoiceServerUpdateData = {
    token: string;
    guild_id: types.Snowflake;
    endpoint: string | null;
}

/****** webhooks ******/

export interface WebhooksUpdatePayload extends EventPayload {
    t: 'WEBHOOKS_UPDATE';
    d: UserUpdateData;
}

export type WebhooksUpdateData = {
    guild_id: types.Snowflake;
    channel_id: types.Snowflake;
}

/****** commands ******/

export interface CommandUpdatePayload extends EventPayload {
    t: 'APPLICATION_COMMAND_CREATE' | 'APPLICATION_COMMAND_UPDATE' | 'APPLICATION_COMMAND_DELETE';
    d: CommandUpdateData;
}

export type CommandUpdateData = types.Command;

export type CommandPermissionsUpdateData = types.CommandPermissions;

/****** interactions ******/

export interface InteractionCreatePayload extends EventPayload {
    t: 'INTERACTION_CREATE';
    d: InteractionCreateData;
}

export type InteractionCreateData = types.Interaction;

/****** stage instances ******/

export interface StageInstanceUpdatePayload extends EventPayload {
    t: 'STAGE_INSTANCE_CREATE' | 'STAGE_INSTANCE_UPDATE' | 'STAGE_INSTANCE_DELETE';
    d: StageInstanceUpdateData;
}

export type StageInstanceUpdateData = types.StageInstance;

/****** automod ******/

export interface AutoModUpdatePayload extends EventPayload {
    t: 'AUTO_MODERATION_RULE_CREATE' | 'AUTO_MODERATION_RULE_UPDATE' | 'AUTO_MODERATION_RULE_DELETE';
    d: AutoModUpdateData;
}

export type AutoModUpdateData = types.AutoModRule;

export interface AutoModExecutePayload extends EventPayload {
    t: 'AUTO_MODERATION_RULE_EXECUTION';
    d: AutoModExecuteData;
}

export type AutoModExecuteData = {
    guild_id: types.Snowflake;
    action: types.AutoModAction;
    rule_id: types.Snowflake;
    rule_trigger_type: num.AUTOMOD_TRIGGER_TYPES;
    user_id: types.Snowflake;
    channel_id?: types.Snowflake;
    message_id?: types.Snowflake;
    alert_system_message_id?: types.Snowflake;
    content: string;
    matched_keyword: string | null;
    matched_content: string | null;
}



/********* non-events *********/

export interface NonEventPayload extends GatewayPayload {
    s: null;
    t: null;
}

export type GatewayData = EventData | SequenceNumber | IdentifyData | UpdatePresenceData | VoiceUpdateData | ResumeData | ReconnectData | RequestMembersData | InvalidSessionData | HelloData | HeartbeatAckData;

/****** heartbeat ******/

export interface HeartbeatPayload extends NonEventPayload {
    op: num.GATEWAY_OPCODES.HEARTBEAT;
    d: SequenceNumber;
}

/****** identify ******/

export interface IdentifyPayload extends NonEventPayload {
    op: num.GATEWAY_OPCODES.IDENTIFY;
    d: IdentifyData;
}

export type IdentifyData = {
    token: string;
    properties: ConnectionProperties;
    compress?: boolean;
    large_threshold?: number;
    shard?: ShardConnectionData;
    presence: UpdatePresenceData;
    intents: types.Flags;
}

export type ConnectionProperties = {
    os: string;
    browser: string;
    device: string;
}

export type ShardConnectionData = [shard_id: number, num_shards: number];

/****** presence update ******/

export interface UpdatePresencePayload extends NonEventPayload {
    op: num.GATEWAY_OPCODES.PRESENCE_UPDATE;
    d: UpdatePresenceData;
}

export interface UpdatePresenceData extends Pick<types.Presence, 'activities' | 'status'> {
    since: types.UnixTimestampMillis | null,
    afk: boolean
}

/****** voice state update ******/

export interface VoiceUpdatePayload extends NonEventPayload {
    op: num.GATEWAY_OPCODES.VOICE_STATE_UPDATE;
    d: VoiceUpdateData;
}

export type VoiceUpdateData = {
    guild_id: types.Snowflake;
    channel_id: types.Snowflake | null;
    self_mute: boolean;
    self_deaf: boolean;
}

/****** resume ******/

export interface ResumePayload extends NonEventPayload {
    op: num.GATEWAY_OPCODES.RESUME;
    d: ResumeData;
}

export type ResumeData = {
    token: string;
    session_id: string;
    seq: number;
}

/****** reconnect ******/

export interface ReconnectPayload extends NonEventPayload {
    op: num.GATEWAY_OPCODES.RECONNECT;
    d: ReconnectData;
}

export type ReconnectData = null;

/****** request guild members ******/

export interface RequestMembersPayload extends NonEventPayload {
    op: num.GATEWAY_OPCODES.REQUEST_GUILD_MEMBERS;
    d: RequestMembersData;
}

// https://canary.discord.com/developers/docs/topics/gateway#request-guild-members
export type RequestMembersData = {
    guild_id: types.Snowflake;
    query?: string;
    limit: number;
    presences?: boolean;
    user_ids?: types.Snowflake | types.Snowflake[];
    nonce?: string;
}

/****** invalid session ******/

export interface InvalidSessionPayload extends NonEventPayload {
    op: num.GATEWAY_OPCODES.INVALID_SESSION;
    d: InvalidSessionData;
}

export type InvalidSessionData = boolean;

/****** hello ******/

export interface HelloPayload extends NonEventPayload {
    op: num.GATEWAY_OPCODES.HELLO;
    d: HelloData;
}

export type HelloData = {
    heartbeat_interval: number;
}

/****** heartbeat ack ******/

export interface HeartbeatAckPayload extends NonEventPayload {
    op: num.GATEWAY_OPCODES.HEARTBEAT_ACK;
    d: HeartbeatAckData;
}

export type HeartbeatAckData = undefined;

/********* misc ********/

export type GatewayInfo = {
    url: types.URL;
}

export interface GatewayBotInfo extends GatewayInfo {
    shards: number;
    session_start_limit: GatewaySessionLimit;
}

export type GatewaySessionLimit = {
    total: number;
    remaining: number;
    reset_after: number;
    max_concurrency: number
}

// used in cache
export type GatewaySessionLimitHash = {
    total: string;
    remaining: string;
    reset_at: string;
    max_concurrency: string
}