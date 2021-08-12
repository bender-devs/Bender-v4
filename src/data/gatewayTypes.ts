
import * as num from './numberTypes';
import events from './eventTypes';
import * as types from './types';

/************ gateway payload types ************/

export type GatewayPayload = {
    op: num.GATEWAY_OPCODES,
    d: GatewayData,
    s: SequenceNumber,
    t: GatewayEventName | null
}

type SequenceNumber = number | null;

/********* events *********/

export type GatewayEventName = typeof events[number];

export interface EventPayload extends GatewayPayload {
    op: num.GATEWAY_OPCODES.DISPATCH,
    d: EventData,
    s: number,
    t: GatewayEventName
}

type EventData = ReadyData | types.Channel | ChannelPinsUpdateData | ThreadSyncData | types.ThreadMember | ThreadMembersUpdateData | types.Guild | types.UnavailableGuild | GuildBanEventData | GuildEmojisUpdateData | GuildIntegrationsUpdateData; // TODO: finish

/****** ready ******/

export interface ReadyPayload extends EventPayload {
    t: 'READY',
    d: ReadyData
}

type ReadyData = {
    v: number;
	user: types.User;
	guilds: types.UnavailableGuild[];
	session_id: string;
	shard?: ShardConnectionData;
	application: types.PartialApplication;
}

/****** channels/threads ******/

export interface ChannelEventPayload extends EventPayload {
    t: 'CHANNEL_CREATE' | 'CHANNEL_UPDATE' | 'CHANNEL_DELETE',
    d: types.Channel
}

export interface ChannelPinsUpdatePayload extends EventPayload {
    t: 'CHANNEL_PINS_UPDATE',
    d: ChannelPinsUpdateData
}

type ChannelPinsUpdateData = {
    guild_id?: types.Snowflake,
    channel_id: types.Snowflake,
    last_pin_timestamp?: types.Timestamp | null
}

export interface ThreadEventPayload extends EventPayload {
    t: 'THREAD_CREATE' | 'THREAD_UPDATE' | 'THREAD_DELETE',
    d: types.ThreadChannel
}

export interface ThreadSyncPayload extends EventPayload {
    t: 'THREAD_LIST_SYNC',
    d: ThreadSyncData
}

type ThreadSyncData = {
    guild_id: types.Snowflake,
    channel_ids?: types.Snowflake[],
    threads: types.ThreadChannel[],
    members: types.ThreadMember[]
}

export interface ThreadMemberUpdatePayload extends EventPayload {
    t: 'THREAD_MEMBER_UPDATE',
    d: types.ThreadMember
}

export interface ThreadMembersUpdatePayload extends EventPayload {
    t: 'THREAD_MEMBERS_UPDATE',
    d: ThreadMembersUpdateData
}

type ThreadMembersUpdateData = {
    id: types.Snowflake,
    guild_id: types.Snowflake,
    member_count: number,
    added_members?: types.ThreadMember[],
    removed_member_ids?: types.Snowflake[]
}

/****** guilds ******/

export interface GuildCreatePayload extends EventPayload {
    t: 'GUILD_CREATE',
    d: types.GatewayGuild
}

export interface GuildUpdatePayload extends EventPayload {
    t: 'GUILD_UPDATE',
    d: types.Guild
}

export interface GuildDeletePayload extends EventPayload {
    t: 'GUILD_DELETE',
    d: types.UnavailableGuild
}

export interface GuildBanEventPayload extends EventPayload {
    t: 'GUILD_BAN_ADD' | 'GUILD_BAN_REMOVE',
    d: GuildBanEventData
}

type GuildBanEventData = {
    guild_id: types.Snowflake,
    user: types.User
}

export interface GuildEmojisUpdatePayload extends EventPayload {
    t: 'GUILD_EMOJIS_UPDATE',
    d: GuildEmojisUpdateData
}

type GuildEmojisUpdateData = {
    guild_id: types.Snowflake,
    emojis: types.Emoji[]
}

export interface GuildIntegrationsUpdatePayload extends EventPayload {
    t: 'GUILD_INTEGRATIONS_UPDATE',
    d: GuildIntegrationsUpdateData
}

type GuildIntegrationsUpdateData = {
    guild_id: types.Snowflake
}

export interface GuildMemberAddPayload extends EventPayload {
    t: 'GUILD_MEMBER_ADD',
    d: GuildMemberAddData
}

interface GuildMemberAddData extends types.Member {
    guild_id: types.Snowflake
}

export interface GuildMemberRemovePayload extends EventPayload {
    t: 'GUILD_MEMBER_REMOVE',
    d: GuildMemberRemoveData
}

interface GuildMemberRemoveData extends types.Member {
    guild_id: types.Snowflake,
    user: types.User
}

/********* non-events *********/

interface NonEventPayload extends GatewayPayload {
    s: null,
    t: null
}

type GatewayData = EventData | SequenceNumber | IdentifyData | PresenceUpdateData | VoiceUpdateData | ResumeData | ReconnectData | RequestMembersData | InvalidSessionData | HelloData | HeartbeatAckData;

/****** heartbeat ******/

export interface HeartbeatPayload extends NonEventPayload {
    op: num.GATEWAY_OPCODES.HEARTBEAT,
    d: SequenceNumber,
}

/****** identify ******/

export interface IdentifyPayload extends NonEventPayload {
    op: num.GATEWAY_OPCODES.IDENTIFY,
    d: IdentifyData,
}

type IdentifyData = {
    token: string,
    properties: ConnectionProperties,
    compress?: boolean,
    large_threshold?: number,
    shard?: ShardConnectionData,
    presence: PresenceUpdateData,
    intents: types.Flags
}

type ConnectionProperties = {
    $os: string,
    $browser: string,
    $device: string
}

type ShardConnectionData = [shard_id: number, num_shards: number];

/****** presence update ******/

export interface PresenceUpdatePayload extends NonEventPayload {
    op: num.GATEWAY_OPCODES.PRESENCE_UPDATE,
    d: PresenceUpdateData,
}

export type PresenceUpdateData = {
    since: number | null;
    status: types.Status;
    activities: types.Activity[];
    afk: boolean;
};

/****** voice state update ******/

export interface VoiceUpdatePayload extends NonEventPayload {
    op: num.GATEWAY_OPCODES.VOICE_STATE_UPDATE,
    d: VoiceUpdateData,
}

type VoiceUpdateData = {
    guild_id: types.Snowflake,
    channel_id: types.Snowflake | null,
    self_mute: boolean,
    self_deaf: boolean
}

/****** resume ******/

export interface ResumePayload extends NonEventPayload {
    op: num.GATEWAY_OPCODES.RESUME,
    d: ResumeData,
}

type ResumeData = {
    token: string,
    session_id: string,
    seq: number
}

/****** reconnect ******/

export interface ReconnectPayload extends NonEventPayload {
    op: num.GATEWAY_OPCODES.RECONNECT,
    d: ReconnectData,
}

type ReconnectData = null;

/****** request guild members ******/

export interface RequestMembersPayload extends NonEventPayload {
    op: num.GATEWAY_OPCODES.REQUEST_GUILD_MEMBERS,
    d: RequestMembersData,
}

// https://canary.discord.com/developers/docs/topics/gateway#request-guild-members
type RequestMembersData = {
    guild_id: types.Snowflake,
    query?: string,
    limit: number,
    presences?: boolean,
    user_ids?: types.Snowflake | types.Snowflake[],
    nonce?: string
}

/****** invalid session ******/

export interface InvalidSessionPayload extends NonEventPayload {
    op: num.GATEWAY_OPCODES.INVALID_SESSION,
    d: InvalidSessionData,
}

type InvalidSessionData = boolean;

/****** hello ******/

export interface HelloPayload extends NonEventPayload {
    op: num.GATEWAY_OPCODES.HELLO,
    d: HelloData,
}

type HelloData = {
    heartbeat_interval: number
}

/****** heartbeat ack ******/

export interface HeartbeatAckPayload extends NonEventPayload {
    op: num.GATEWAY_OPCODES.HEARTBEAT_ACK,
    d: HeartbeatAckData,
}

type HeartbeatAckData = undefined;