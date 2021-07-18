import * as superagent from 'superagent';

/************ request types ************/

export type RequestOptions = {
    data?: Record<string, unknown>;
    headers?: Record<string, string>;
    query?: Record<string, string | number | null | undefined | boolean>;
    retries?: number;
    responseTimeout?: number;
    deadlineTimeout?: number;
};

export type RequestResponse = Promise<superagent.Response | Error>;

/************ guild types ************/

export type User = {
    id: string,
    username: string,
    discriminator: number
}

export type Presence = {}; // TODO: finish

/************ guild types ************/

// this is incomplete, see https://canary.discord.com/developers/docs/resources/guild#guild-object-guild-structure
export type Guild = {
    id: string;
    name: string;
    icon: string | null;
    owner_id: string;
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

export type VoiceState = {}; // TODO: finish

/************ role types ************/

export type Role = Record<string, any>;

/************ member types ************/

export type Member = Record<string, any>;

/************ channel types ************/

export type Channel = {
    id: string;
    type: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 10 | 11 | 12 | 13;
    name?: string;
    guild_id?: string;
    position?: number;
    permission_overwrites?: Array<PermissionOverwrites>;
}

interface NestableChannel extends Channel {
    parent_id?: string;
}

interface TextBasedChannel extends NestableChannel {
    topic: string | null;
    nsfw: boolean;
    last_message_id: string | null;
    rate_limit_per_user?: number;
    last_pin_timestamp: Timestamp;
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
    parent_id?: string;
}
export interface VoiceChannel extends VoiceBasedChannel {
    type: 2;
}
export interface GroupDMChannel extends DMBasedChannel {
    type: 3;
    owner_id: string;
    application_id?: string;
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
    owner_id: string;
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
    id?: string,
    user_id?: string;
    join_timestamp: Timestamp;
    flags: number;
}

export type Region = {
    id: string,
    name: string;
    vip: boolean;
    optimal: boolean;
    deprecated: boolean;
    custom: boolean;
}

export type PermissionOverwrites = {
    id: string;
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
    roles: Array<string>;
    users: Array<string>;
    replied_user?: boolean;
};

export type MessageReference = {
    message_id?: string;
    channel_id?: string;
    guild_id?: string;
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
    url?: string;
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
    url?: string;
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
    icon_url?: string;
    proxy_icon_url?: string;
};
export type EmbedMedia = {
    url: string;
    proxy_url?: string;
    height?: number;
    width?: number;
};
export type EmbedProvider = {
    name: string;
    url: string;
};
export type EmbedAuthor = {
    name: string;
    url?: string;
    icon_url?: string;
    proxy_url?: string;
};
export type EmbedField = {
    name: string;
    value: string;
    inline?: boolean;
};

/************ misc types ************/

// ISO8601 timestamp
type Timestamp = string;

// bitfield number represented as string
type Bitfield = string;

// URI encoded image
type ImageData = string;

export type Emoji = {
    name: string | null;
    id: string | null;
    animated?: boolean;
    roles?: Array<string>;
    user?: User;
    require_colons?: boolean;
    managed?: boolean;
    available?: boolean;
};

export type EmojiData = {
    name: string;
    image: ImageData;
    roles: Array<string>;
}

export type BanData = {
    reason?: string;
    delete_message_days?: number;
};

export type MessageFetchOptions = {
    limit: number;
    around?: string;
    before?: string;
    after?: string;
}

export type ReactionFetchOptions = {
    limit: number;
    after?: string;
}

export type ClientConnectionOptions = {};