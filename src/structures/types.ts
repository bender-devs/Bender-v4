import * as superagent from 'superagent';

/************ request types ************/

export type RequestOptions = {
    data?: Record<string, unknown> | unknown[];
    headers?: RequestHeaders;
    query?: Record<string, unknown>;
    retries?: number;
    responseTimeout?: number;
    deadlineTimeout?: number;
};

export type RequestHeaders = Record<string, string>;

interface TypedResponse<BodyType> extends superagent.Response {
    body: BodyType;
}

export type RequestResponse<ResponseType> = Promise<TypedResponse<ResponseType> | Error>;

/************ guild types ************/

export type User = {
    id: Snowflake;
    username: string;
    discriminator: number;
    avatar: string | null;
    bot?: boolean;
    system?: boolean;
    mfa_enabled?: boolean;
    locale?: string;
    varified?: boolean;
    email?: string;
    flags?: Flags;
    premium_type?: 0 | 1 | 2;
    public_flags?: Flags;
}

export type Presence = {
    user: User;
    guild_id: Snowflake;
    status: Status;
    activities: Activity[];
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
    buttons?: ActivityButton[];
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

export type Guild = {
    id: Snowflake;
    name: string;
    icon: string | null;
    splash: string | null;
    discovery_splash: string | null;
    owner_id: Snowflake;
    afk_channel_id: Snowflake | null;
    afk_timeout: number;
    widget_enabled?: boolean;
    widget_channel_id?: Snowflake | null;
    verification_level: 0 | 1 | 2 | 3 | 4;
    default_message_notifications: 0 | 1;
    explicit_content_filter: 0 | 1 | 2;
    roles: Role[];
    emojis: Emoji[];
    features: GuildFeature[];
    mfa_level: 0 | 1;
    application_id: Snowflake | null;
    system_channel_id: Snowflake | null;
    system_channel_flags: Flags;
    rules_channel_id: Snowflake | null;
    max_presences?: number | null;
    max_members?: number;
    vanity_url_code: string | null;
    description: string | null;
    banner: string | null;
    premium_tier: 0 | 1 | 2 | 3;
    premium_subscription_count?: number;
    preferred_locale: string;
    public_updates_channel_id: Snowflake | null;
    max_video_channel_users?: number;
    approximate_member_count?: number;
    approximate_presence_count?: number;
    welcome_screen?: WelcomeScreen;
    nsfw_level: 0 | 1 | 2 | 3;
};

type WelcomeScreen = {
    description: string | null;
    welcome_channels: WelcomeChannel[];
}
type WelcomeChannel = {
    channel_id: Snowflake;
    description: string;
    emoji_id: Snowflake | null;
    emoji_name: string | null;
}

// the following props are only sent in GUILD_CREATE
export interface GatewayGuild extends Guild {
    joined_at: Timestamp;
    large: boolean;
    unavailable: boolean;
    member_count: number;
    voice_states: VoiceState[];
    members: Member[];
    channels: GuildChannel[];
    threads: ThreadChannel[];
    presences: Presence[];
    stage_instances: StageInstance[];
}

type StageInstance = {
    id: Snowflake;
    guild_id: Snowflake;
    channel_id: Snowflake;
    topic: string;
    privacy_level: 1 | 2;
    discoverable_disabled: boolean;
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

export interface PartialMember {
    user?: User; // Not included in MESSAGE_CREATE and MESSAGE_UPDATE member objects
    nick?: string;
    roles: Snowflake[];
    joined_at: Timestamp;
    premium_since?: Timestamp | null;
    pending?: boolean; // member screening, only included in GUILD_* events
    permissions?: Bitfield; // only provided in Interaction objects; includes overwrites
}

export interface Member extends PartialMember {
    user: User;
    deaf: boolean;
    mute: boolean;
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

/* channel types
 * GUILD_TEXT	0
 * DM	1
 * GUILD_VOICE	2
 * GROUP_DM	3
 * GUILD_CATEGORY	4
 * GUILD_NEWS	5
 * GUILD_STORE	6
 * GUILD_NEWS_THREAD	10
 * GUILD_PUBLIC_THREAD	11
 * GUILD_PRIVATE_THREAD	12
 * GUILD_STAGE_VOICE	13
 */
type ChannelType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 10 | 11 | 12 | 13;

type PartialChannel = {
    id: Snowflake;
    type: ChannelType;
    name?: string;
    permission_overwrites?: PermissionOverwrites[];
}

export interface Channel extends PartialChannel {
    position?: number;
}

export interface GuildChannel extends Channel {
    parent_id?: Snowflake;
    guild_id: Snowflake;
}

export interface DMBasedChannel extends Channel {
    type: 1 | 3;
    recipients: User[];
}

interface TextBasedChannel extends GuildChannel {
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

export interface DMChannel extends DMBasedChannel {
    type: 1;
}

export interface VoiceBasedChannel extends GuildChannel {
    type: 2 | 13;
    rtc_region: VoiceRegion | null;
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

interface ThreadChannel extends GuildChannel {
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
    flags: Flags;
}

export type VoiceRegion = {
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

/************ interaction types ************/

type InteractionType = 1 | 2 | 3; // 1 = ping, 2 = command, 3 = component

export type Interaction = {
    id: Snowflake;
    application_id: Snowflake;
    type: InteractionType;
    data?: InteractionData;
    guild_id?: Snowflake;
    channel_id?: Snowflake;
    member?: Member;
    user?: User;
    token: string;
    version: 1;
    message?: Message;
}

export type InteractionData = {
    id: Snowflake;
    name: string;
    resolved?: InteractionDataResolved;
    options?: InteractionDataOption[];
    custom_id: string;
    component_type: MessageComponentType;
}

export type InteractionDataResolved = {
    users?: Record<Snowflake, User>;
    members?: Record<Snowflake, PartialMember>;
    roles?: Record<Snowflake, Role>;
    channels?: Record<Snowflake, PartialChannel>;
}

export type InteractionDataOption = {
    name: string;
    type: CommandOptionType;
    value?: CommandOptionValue;
    options?: InteractionDataOption[];
}

/* response types:
 * PONG 1
 * CHANNEL_MESSAGE_WITH_SOURCE  4
 * DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE 5
 * DEFERRED_UPDATE_MESSAGE  6
 * UPDATE_MESSAGE   7
 */
type InteractionResponseType = {
    type: 1 | 4 | 5 | 6 | 7;
}

export type InteractionResponse = {
    type: InteractionResponseType;
    data?: InteractionResponseData;
}

export type InteractionResponseData = {
    tts?: boolean;
    content?: string;
    embeds?: Embed[];
    allowed_mentions?: AllowedMentions;
    flags?: Flags;
    components?: MessageComponent[];
}

export type MessageInteraction = {
    id: Snowflake;
    type: InteractionType;
    name: string;
    user: User;
}

/****** slash command types ******/

// for creating/editing only
export type CommandData = {
    name: string;
    description: string;
    options?: CommandOption[];
    default_permission?: boolean;
}

export interface Command extends CommandData {
    id: Snowflake;
    application_id: Snowflake;
    guild_id?: Snowflake;
}

/* command option types:
 * SUB_COMMAND	1
 * SUB_COMMAND_GROUP	2
 * STRING	3
 * INTEGER	4
 * BOOLEAN	5
 * USER	6
 * CHANNEL	7
 * ROLE	8
 * MENTIONABLE	9
 */
export type CommandOptionType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type CommandOptionValue = CommandOption | string | number | boolean | User | Channel | Role;

export type CommandOption = {
    type: CommandOptionType;
    name: string;
    description: string;
    required?: boolean;
    choices?: CommandOptionChoice[];
    options?: CommandOption[];
}

type CommandOptionChoice = {
    name: string;
    value: string | number;
}

export type CommandPermissions = {
    id: Snowflake;
    application_id: Snowflake;
    guild_id: Snowflake;
    permissions: CommandPermissionsData[];
}

export type CommandPermissionsData = {
    id: Snowflake;
    type: 1 | 2; // 1 = role, 2 = user
    permission: boolean;
}

/************ message types ************/

export type Message = {
    id: Snowflake;
    channel_id: Snowflake;
    guild_id?: Snowflake;
    author: User;
    member?: Member; // only included in MESSAGE_CREATE and MESSAGE_UPDATE
    content: string;
    timestamp: Timestamp;
    edited_timestamp: Timestamp | null;
    tts: boolean;
    mention_everyone: boolean;
    mentions?: User[];
    file?: Buffer;
    embeds?: Embed[];
    allowed_mentions?: AllowedMentions;
    message_reference?: MessageReference;
    components?: MessageComponent[];
}

export type AllowedMentions = {
    parse: Array<"roles" | "users" | "everyone">;
    roles: Snowflake[];
    users: Snowflake[];
    replied_user?: boolean;
};

export type MessageReference = {
    message_id?: Snowflake;
    channel_id?: Snowflake;
    guild_id?: Snowflake;
    fail_if_not_exists?: boolean;
};

/****** message component types ******/

// https://canary.discord.com/developers/docs/interactions/message-components#component-object
type MessageComponentType = 1 | 2 | 3;
type MessageComponent = {
    type: MessageComponentType;
};
export interface MessageComponentRow extends MessageComponent {
    type: 1;
    components: MessageComponent[];
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
    options: MessageComponentSelectOption[];
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
    fields?: EmbedField[];
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
    roles?: Snowflake[];
    user?: User;
    require_colons?: boolean;
    managed?: boolean;
    available?: boolean;
};

export type Ban = {
    reason: string | null;
    user: User;
};

export type PruneResult = {
    pruned: number;
}

/****** editing/fetching types ******/

export type GuildData = {
    name?: string;
    verification_level?: 0 | 1 | 2 | 3 | 4 | null;
    default_message_notifications?: 0 | 1 | null;
    explicit_content_filter?: 0 | 1 | 2 | null;
    afk_channel_id?: Snowflake | null;
    afk_timeout?: number;
    icon?: ImageData | null;
    owner_id?: Snowflake;
    splash?: ImageData | null;
    discovery_splash?: ImageData | null;
    banner?: ImageData | null;
    system_channel_id?: Snowflake | null;
    system_channel_flags?: Flags;
    rules_channel_id?: Snowflake | null;
    public_updates_channel_id?: Snowflake | null;
    preferred_locale?: string | null;
    features?: GuildFeature[];
    description?: string | null;
}

export type RoleData = {
    name?: string;
    color?: number;
    hoist?: boolean;
    position?: number;
    permissions?: Bitfield;
    managed?: boolean;
    mentionable?: boolean;
}

export type MemberData = {
    nick?: string;
    roles?: Snowflake[];
    deaf?: boolean;
    mute?: boolean;
    channel_id?: Snowflake | null;
}

export type UserData = {
    username?: string;
    avatar?: ImageData | null;
}

export type EmojiCreateData = {
    name: string;
    image: ImageData;
    roles: string[];
}

export type EmojiEditData = {
    name?: string;
    roles?: string[];
}

export type RolePositionData = {
    id: Snowflake;
    position?: number | null;
}

export type ChannelPositionData = {
    id: Snowflake;
    position: number | null;
    lock_permissions?: boolean | null;
    parent_id?: Snowflake | null;
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
    include_roles?: Snowflake[];
}

export type PruneData = {
    days: number,
    include_roles?: Snowflake[];
    compute_prune_count: boolean;
}

export type MessageData = {
    content?: string;
    file?: Buffer;
    embeds?: Embed[];
    allowed_mentions?: AllowedMentions;
    message_reference?: MessageReference;
    components?: MessageComponent[];
}

/****** special dev types ******/

type CustomEmojiIdentifier = `${string}:${Snowflake}`;

type UnicodeEmoji = string;

// formatted as name:id (i.e. ) or Unicode emoji (i.e. 🔥)
export type EmojiIdentifier = CustomEmojiIdentifier | UnicodeEmoji;

// ISO8601 timestamp
type Timestamp = `${number}-${number}-${number}T${number}:${number}:${number}.${number}Z`;

// bitfield number represented as string
type Bitfield = `${number | bigint}`;

// bitfield number represented as number
type Flags = number;

// URI encoded image
type ImageData = `data:image/${"jpeg" | "png" | "gif"};base64,${string}`;

// Any kind of URL
type URL = `${string}://${string}`;

// Discord Snowflake, 18-20 digits
export type Snowflake = `${number | bigint}`;

export type SnowflakeOrMe = Snowflake | "@me";

// Unix timestamp (millis since epoch)
type UnixTimestamp = number;