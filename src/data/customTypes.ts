import * as superagent from 'superagent';

/************ request types ************/

export type RequestOptions = {
    data?: Record<string, unknown> | Array<unknown>;
    headers?: RequestHeaders;
    query?: Record<string, unknown>;
    retries?: number;
    responseTimeout?: number;
    deadlineTimeout?: number;
};

export type RequestHeaders = Record<string, string>;

export type RequestResponse = Promise<superagent.Response | Error>;

/************ guild types ************/

export type User = {
    id: Snowflake,
    username: string,
    discriminator: number
}

export type Presence = {
    user: User;
    guild_id: Snowflake;
    status: Status;
    activities: Array<Activity>;
    client_status: ClientStatus;
};

type Status = "idle" | "dnd" | "online" | "offline";

type ClientStatus = {
    desktop?: Status;
    mobile?: Status;
    web?: Status;
};

export type Activity = {
    name: string;
    type: 0 | 1 | 2 | 3 | 4 | 5;
    url?: URL | null;
    created_at: UnixTimestamp;
    timestamps?: ActivityTimestamps;
    application_id?: Snowflake;
    details?: string | null;
    state?: string | null;
    emoji?: Emoji | null;
    party?: ActivityParty;
    assets?: ActivityAssets;
    secrets?: ActivitySecrets;
    instance?: boolean;
    flags?: Bitfield;
    buttons?: Array<ActivityButton>;
};

type ActivityTimestamps = {
    start?: UnixTimestamp;
    end?: UnixTimestamp;
}
type ActivityParty = {
    id?: Snowflake; // TODO: Should this be string instead?
    size?: [number, number];
}
type ActivityAssets = {
    large_image?: URL;
    large_text?: string;
    small_image?: URL;
    small_text?: string;
}
type ActivitySecrets = {
    join?: string;
    spectate?: string;
    match?: string;
}
type ActivityButton = {
    label: string;
    url: URL;
}

/************ guild types ************/

// this is incomplete, see https://canary.discord.com/developers/docs/resources/guild#guild-object-guild-structure
export type Guild = {
    id: Snowflake;
    name: string;
    icon: string | null;
    owner_id: Snowflake;
    verification_level: 0 | 1 | 2 | 3 | 4;
    roles: Array<Role>;
    emojis: Array<Emoji>;
    premium_tier: 0 | 1 | 2 | 3; 
    approximate_member_count?: number;
    approximate_presence_count?: number;
};

export interface GatewayGuild extends Guild {
    joined_at: Timestamp;
    unavailable: boolean;
    member_count: number;
    voice_states: Array<VoiceState>;
    members: Array<Member>;
    channels: Array<Channel>;
    threads: Array<ThreadChannel>;
    presences?: Array<Presence>;
}

// explanation of features: https://canary.discord.com/developers/docs/resources/guild#guild-object-guild-features
export type GuildFeature = "ANIMATED_ICON" | "BANNER" | "COMMERCE" | "COMMUNITY" | "DISCOVERABLE" | "FEATURABLE" | "INVITE_SPLASH" | "MEMBER_VERIFICATION_GATE_ENABLED" | "NEWS" | "PARTNERED" | "PREVIEW_ENABLED" | "VANITY_URL" | "VERIFIED" | "VIP_REGIONS" | "WELCOME_SCREEN_ENABLED" | "TICKETED_EVENTS_ENABLED" | "MONETIZATION_ENABLED" | "MORE_STICKERS" | "THREE_DAY_THREAD_ARCHIVE" | "SEVEN_DAY_THREAD_ARCHIVE" | "PRIVATE_THREADS";

export type VoiceState = {
    guild_id?: Snowflake;
    channel_id: Snowflake | null;
    user_id: Snowflake;
    member?: Member;
    session_id: string;
    deaf: boolean;
    mute: boolean;
    self_deaf: boolean;
    self_mute: boolean;
    self_stream?: boolean;
    self_video: boolean;
    suppress: boolean;
    request_to_speak_timestamp: Timestamp | null;
};

/************ role types ************/

export type Role = {
    id: Snowflake;
    name: string;
    color: number;
    hoist: boolean;
    position: number;
    permissions: Bitfield;
    managed: boolean;
    mentionable: boolean;
    tags?: RoleTags;
}

type RoleTags = {
    bot_id?: Snowflake;
    integration_id?: Snowflake;
    premium_subscriber?: null;
}

/************ member types ************/

export type MemberData = {
    nick?: string;
    roles?: Array<Snowflake>;
    deaf?: boolean;
    mute?: boolean;
}

export type Member = {
    user?: User; // Not included in MESSAGE_CREATE and MESSAGE_UPDATE member objects
    nick?: string;
    roles: Array<Snowflake>;
    joined_at: Timestamp;
    premium_since?: Timestamp | null;
    deaf: boolean;
    mute: boolean;
    pending?: boolean; // member screening
    permissions?: Bitfield; // only provided in Interaction objects; includes overwrites
}

/************ channel types ************/

// for editing only
export type ChannelData = {
    name?: string;
    nsfw?: boolean;
    rate_limit_per_user?: number;
    bitrate?: number;
    user_limit?: number;
    thread_metadata?: ThreadMeta;
}

export type Channel = {
    id: Snowflake;
    type: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 10 | 11 | 12 | 13;
    name?: string;
    guild_id?: Snowflake;
    position?: number;
    permission_overwrites?: Array<PermissionOverwrites>;
}

interface NestableChannel extends Channel {
    parent_id?: Snowflake;
}

interface TextBasedChannel extends NestableChannel {
    topic?: string | null;
    nsfw: boolean;
    last_message_id?: Snowflake | null;
    rate_limit_per_user?: number;
    last_pin_timestamp?: Timestamp | null;
    default_auto_archive_duration?: number;
}
export interface TextChannel extends TextBasedChannel {
    type: 0;
}
interface DMBasedChannel extends Channel {
    type: 1 | 3;
    recipients: Array<User>;
}
export interface DMChannel extends DMBasedChannel {
    type: 1;
}
export interface VoiceBasedChannel extends NestableChannel {
    type: 2 | 13;
    rtc_region: Region | null;
    bitrate: number;
    user_limit: number;
    video_quality_mode?: 1 | 2;
}
export interface VoiceChannel extends VoiceBasedChannel {
    type: 2;
}
export interface GroupDMChannel extends DMBasedChannel {
    type: 3;
    owner_id: Snowflake;
    application_id?: Snowflake;
    icon: string | null;
}
export interface CategoryChannel extends Channel {
    type: 4;
}
export interface NewsChannel extends TextBasedChannel {
    type: 5;
}
export interface StoreChannel extends TextBasedChannel {
    type: 6;
}
interface ThreadChannel extends NestableChannel {
    type: 10 | 11 | 12;
    thread_metadata: ThreadMeta;
    member: ThreadMember;
    message_count: number;
    member_count: number;
    owner_id: Snowflake;
}
export interface NewsThreadChannel extends ThreadChannel {
    type: 10;
}
export interface PublicThreadChannel extends ThreadChannel {
    type: 11;
}
export interface PrivateThreadChannel extends ThreadChannel {
    type: 12;
}
export interface VoiceStageChannel extends VoiceBasedChannel {
    type: 13;
}

export type ThreadMeta = {
    archived: boolean;
    auto_archive_duration: number;
    archive_timestamp: Timestamp;
    locked: boolean;
}

export type ThreadMember = {
    id?: Snowflake,
    user_id?: Snowflake;
    join_timestamp: Timestamp;
    flags: number;
}

export type Region = {
    id: Snowflake,
    name: string;
    vip: boolean;
    optimal: boolean;
    deprecated: boolean;
    custom: boolean;
}

export type PermissionOverwrites = {
    id: Snowflake;
    type: 0 | 1;
    allow: Bitfield;
    deny: Bitfield;
}

/************ message types ************/

export type Message = {
    content?: string;
    file?: Buffer;
    embeds?: Array<Embed>;
    allowed_mentions?: AllowedMentions;
    message_reference?: MessageReference;
    components?: Array<MessageComponent>;
}

export type AllowedMentions = {
    parse: Array<"roles" | "users" | "everyone">;
    roles: Array<Snowflake>;
    users: Array<Snowflake>;
    replied_user?: boolean;
};

export type MessageReference = {
    message_id?: Snowflake;
    channel_id?: Snowflake;
    guild_id?: Snowflake;
    fail_if_not_exists?: boolean;
};

// https://canary.discord.com/developers/docs/interactions/message-components#component-object
type MessageComponent = {
    type: 1 | 2 | 3;
};
export interface MessageComponentRow extends MessageComponent {
    type: 1;
    components: Array<MessageComponent>;
}
export interface MessageComponentButton extends MessageComponent {
    type: 2;
    custom_id?: string;
    disabled?: boolean;
    style?: 1 | 2 | 3 | 4 | 5;
    label?: string;
    emoji?: Emoji;
    url?: URL;
}
export interface MessageComponentSelect extends MessageComponent {
    type: 3;
    custom_id?: string;
    disabled?: boolean;
    options: Array<MessageComponentSelectOption>;
    placeholder?: string;
    min_values?: number;
    max_values?: number;
}
export type MessageComponentSelectOption = {
    label: string,
    value: string,
    description?: string;
    emoji?: Emoji;
    default?: boolean;
}

/****** embed types ******/

export type Embed = {
    title?:	string;
    type?: string;
    description?: string;
    url?: URL;
    timestamp?: Timestamp;
    color?: number;
    footer?: EmbedFooter;
    image?: EmbedMedia;
    thumbnail?: EmbedMedia;
    video?: EmbedMedia;
    provider?: EmbedProvider;
    author?: EmbedAuthor;
    fields?: Array<EmbedField>;
}

export type EmbedFooter = {
    text: string;
    icon_url?: URL;
    proxy_icon_url?: URL;
};
export type EmbedMedia = {
    url: string;
    proxy_url?: URL;
    height?: number;
    width?: number;
};
export type EmbedProvider = {
    name?: string;
    url?: URL;
};
export type EmbedAuthor = {
    name: string;
    url?: URL;
    icon_url?: URL;
    proxy_url?: URL;
};
export type EmbedField = {
    name: string;
    value: string;
    inline?: boolean;
};

/************ client types ************/

export type ClientConnectionOptions = {}; // TODO: fisnish

/************ misc types ************/

export type Emoji = {
    name: string | null;
    id: Snowflake | null;
    animated?: boolean;
    roles?: Array<Snowflake>;
    user?: User;
    require_colons?: boolean;
    managed?: boolean;
    available?: boolean;
};

export type Ban = {
    reason: string | null;
    user: User;
};

/****** editing/fetching types ******/

export type UserData = {
    username?: string;
    avatar?: ImageData | null;
}

export type EmojiData = {
    name: string;
    image: ImageData;
    roles: Array<string>;
}

export type EmojiEditData = {
    name?: string;
    roles?: Array<string>;
}

export type RolePositionData = {
    id: Snowflake;
    position?: number | null;
}

export type MessageFetchData = {
    limit: number;
    around?: Snowflake;
    before?: Snowflake;
    after?: Snowflake;
}

export type ReactionFetchData = {
    limit: number;
    after?: Snowflake;
}

export type PruneCountData = {
    days: number,
    include_roles?: Array<Snowflake>;
}

export type PruneData = {
    days: number,
    include_roles?: Array<Snowflake>;
    compute_prune_count: boolean;
}

/****** special dev types ******/

// ISO8601 timestamp
type Timestamp = `${number}-${number}-${number}T${number}:${number}:${number}.${number}Z`;

// bitfield number represented as string
type Bitfield = `${bigint}`;

// URI encoded image
type ImageData = string;

// Any kind of URL
type URL = `${string}://${string}`;

// Discord Snowflake, 18-20 digits
export type Snowflake = `${bigint | number | "@me"}`;

// Unix timestamp (millis since epoch)
type UnixTimestamp = number;