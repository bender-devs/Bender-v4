import type * as superagent from 'superagent';
import type Bot from '../structures/bot.js';
import type { EventData, EventName, LowercaseEventName } from './gatewayTypes.js';
import type * as num from './numberTypes.js';

/************ request types ************/

export type RequestOptions = {
    data?: Record<string, unknown> | unknown[] | GuildData | MessageData; // added GuildData and MessageData since they are interfaces and can't be indexed properly
    headers?: RequestHeaders;
    query?: Record<string, unknown>;
    retries?: number;
    responseTimeout?: number;
    deadlineTimeout?: number;
};

export type RequestHeaders = Record<string, string>;

export interface TypedResponse<BodyType> extends superagent.Response {
    body: BodyType;
}

export type RequestResponse<ResponseType> = Promise<TypedResponse<ResponseType>>;

export type ResponseError = superagent.ResponseError;

/************ user types ************/

export type UserData = {
    username?: string;
    avatar?: ImageData | null;
};

export type PartialUser = {
    id: Snowflake;
    username: string;
    discriminator: StringNum;
    global_name: string | null;
    avatar: string | null;
};

export interface User extends PartialUser {
    bot?: boolean;
    system?: boolean;
    mfa_enabled?: boolean;
    locale?: Locale;
    verified?: boolean;
    email?: string;
    flags?: num.USER_FLAGS;
    premium_type?: num.PREMIUM_TYPES;
    public_flags?: num.USER_FLAGS;
    banner?: string | null;
    accent_color?: number;
    avatar_decoration?: string | null;
}

export type StringPremiumTypes = `${num.PREMIUM_TYPES}`;

export interface UserBaseHash extends DynamicStringMap {
    id: Snowflake;
    username: string;
    discriminator: StringNum;
    global_name: string;
    avatar: string;
}

export interface UserHash extends UserBaseHash {
    bot?: StringBool;
    system?: StringBool;
    mfa_enabled?: StringBool;
    locale?: string;
    verified?: StringBool;
    email?: string;
    flags?: StringNum;
    premium_type?: StringPremiumTypes;
    public_flags?: StringNum;
}

export type Presence = {
    user: { id: Snowflake };
    guild_id: Snowflake;
    status: Status;
    activities: Activity[];
    client_status: ClientStatus;
};

export type Status = 'idle' | 'dnd' | 'online' | 'offline';

export type ClientStatus = {
    desktop?: Status;
    mobile?: Status;
    web?: Status;
};

export type Activity = {
    name: string;
    type: num.ACTIVITY_TYPES;
    url?: URL | null;
    created_at: UnixTimestampMillis;
    timestamps?: ActivityTimestamps;
    application_id?: Snowflake;
    details?: string | null;
    state?: string | null;
    emoji?: PartialEmoji | null;
    party?: ActivityParty;
    assets?: ActivityAssets;
    secrets?: ActivitySecrets;
    instance?: boolean;
    flags?: Bitfield;
    buttons?: ActivityButton[];
};

export type ActivityTimestamps = {
    start?: UnixTimestampMillis;
    end?: UnixTimestampMillis;
};
export type ActivityParty = {
    id?: string;
    size?: [current_size: number, max_size: number];
};
export type ActivityAssets = {
    large_image?: URL;
    large_text?: string;
    small_image?: URL;
    small_text?: string;
};
export type ActivitySecrets = {
    join?: string;
    spectate?: string;
    match?: string;
};
export type ActivityButton = {
    label: string;
    url: URL;
};

/************ guild types ************/

type GuildDataPartial = Partial<
    Pick<
        Guild,
        | 'name'
        | 'verification_level'
        | 'default_message_notifications'
        | 'explicit_content_filter'
        | 'afk_channel_id'
        | 'afk_timeout'
        | 'owner_id'
        | 'banner'
        | 'system_channel_id'
        | 'system_channel_flags'
        | 'rules_channel_id'
        | 'public_updates_channel_id'
        | 'preferred_locale'
        | 'features'
        | 'description'
    >
>;

export interface GuildData extends GuildDataPartial {
    icon?: ImageData | null;
    splash?: ImageData | null;
    discovery_splash?: ImageData | null;
}

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
    verification_level: num.VERIFICATION_LEVELS;
    default_message_notifications: num.MESSAGE_NOTIFICATION_LEVELS;
    explicit_content_filter: num.EXPLICIT_FILTER_LEVELS;
    roles: Role[];
    emojis: Emoji[];
    features: GuildFeature[];
    mfa_level: num.MFA_LEVELS;
    application_id: Snowflake | null;
    system_channel_id: Snowflake | null;
    system_channel_flags: num.SYSTEM_CHANNEL_FLAGS;
    rules_channel_id: Snowflake | null;
    max_presences?: number | null;
    max_members?: number;
    vanity_url_code: string | null;
    description: string | null;
    banner: string | null;
    premium_tier: num.PREMIUM_TIERS;
    premium_subscription_count?: number;
    preferred_locale: Locale;
    public_updates_channel_id: Snowflake | null;
    max_video_channel_users?: number;
    approximate_member_count?: number;
    approximate_presence_count?: number;
    welcome_screen?: WelcomeScreen;
    nsfw_level: num.NSFW_LEVELS;
    stickers?: Sticker[];
    premium_progress_bar_enabled: boolean;
};

export interface PartialGuild
    extends Pick<
        Guild,
        | 'id'
        | 'name'
        | 'splash'
        | 'banner'
        | 'description'
        | 'icon'
        | 'features'
        | 'verification_level'
        | 'vanity_url_code'
        | 'premium_subscription_count'
        | 'welcome_screen'
        | 'nsfw_level'
    > {
    nsfw?: boolean;
}

export type UnavailableGuild = {
    id: Snowflake;
    unavailable?: true;
};

export type WelcomeScreen = {
    description: string | null;
    welcome_channels: WelcomeChannel[];
};
export type WelcomeChannel = {
    channel_id: Snowflake;
    description: string;
    emoji_id: Snowflake | null;
    emoji_name: string | null;
};

export interface GatewayGuildBase extends Guild {
    joined_at: Timestamp;
    large: boolean;
    unavailable: boolean;
    member_count: number;
}

// the following props are only sent in GUILD_CREATE
export interface GatewayGuild extends GatewayGuildBase {
    voice_states: VoiceState[];
    members: Member[];
    channels: GuildChannel[];
    threads: ThreadChannel[];
    presences: Presence[];
    stage_instances: StageInstance[];
}

export type StageInstance = {
    id: Snowflake;
    guild_id: Snowflake;
    channel_id: Snowflake;
    topic: string;
    privacy_level: num.STAGE_PRIVACY_LEVELS;
    discoverable_disabled: boolean;
};

// explanation of features: https://canary.discord.com/developers/docs/resources/guild#guild-object-guild-features
export type GuildFeature =
    | 'ANIMATED_ICON'
    | 'BANNER'
    | 'COMMERCE'
    | 'COMMUNITY'
    | 'DISCOVERABLE'
    | 'FEATURABLE'
    | 'INVITE_SPLASH'
    | 'MEMBER_VERIFICATION_GATE_ENABLED'
    | 'NEWS'
    | 'PARTNERED'
    | 'PREVIEW_ENABLED'
    | 'VANITY_URL'
    | 'VERIFIED'
    | 'VIP_REGIONS'
    | 'WELCOME_SCREEN_ENABLED'
    | 'TICKETED_EVENTS_ENABLED'
    | 'MONETIZATION_ENABLED'
    | 'MORE_STICKERS'
    | 'THREE_DAY_THREAD_ARCHIVE'
    | 'SEVEN_DAY_THREAD_ARCHIVE'
    | 'PRIVATE_THREADS';

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

export type Ban = {
    reason: string | null;
    user: User;
};

export type BanFetchData = {
    limit?: number;
    before?: Snowflake;
    after?: Snowflake;
};

export type Reaction = {
    count: number;
    me: boolean;
    emoji: PartialEmoji;
};

export type ReactionFetchData = {
    limit: number;
    after?: Snowflake;
};

/*** onboarding types ***/

export type Onboarding = {
    guild_id: Snowflake;
    prompts: OnboardingPrompt[];
    default_channel_ids: Snowflake[];
    enabled: boolean;
    mode: num.ONBOARDING_MODES;
};

export type OnboardingPrompt = {
    id: Snowflake;
    type: num.ONBOARDING_PROMPT_TYPES;
    options: OnboardingPromptOption[];
    title: string;
    single_select: boolean;
    required: boolean;
    in_onboarding: boolean;
};

export type OnboardingPromptOption = {
    id: Snowflake;
    channel_ids: Snowflake[];
    role_ids: Snowflake[];
    emoji: PartialEmoji;
    title: string;
    description: string | null;
};

/****** scheduled event types ******/

export type GuildScheduledEvent = {
    id: Snowflake;
    guild_id: Snowflake;
    channel_id: Snowflake | null;
    creator_id: Snowflake | null;
    name: string;
    description?: string | null;
    scheduled_start_time: Timestamp;
    scheduled_end_time: Timestamp | null;
    privacy_level: num.GUILD_SCHEDULED_EVENT_PRIVACY_LEVEL;
    status: num.GUILD_SCHEDULED_EVENT_STATUS;
    entity_type: num.GUILD_SCHEDULED_EVENT_ENTITY_TYPES;
    entity_id: Snowflake | null;
    entity_metadata: GuildScheduledEventEntityMetadata;
    creator?: User;
    user_count?: number;
    image?: string | null;
};

export type GuildScheduledEventEntityMetadata = {
    location?: string;
};

export type GuildScheduledEventUser = {
    guild_scheduled_event_id: Snowflake;
    user: User;
    member?: Member;
};

/****** member prune types ******/

export type PruneResult = {
    pruned: number;
};

export type PruneCountData = {
    days: number;
    include_roles?: Snowflake[];
};

export type PruneData = {
    days: number;
    include_roles?: Snowflake[];
    compute_prune_count: boolean;
};

/****** emoji types ******/

export type Emoji = {
    name: string;
    id: Snowflake;
    animated?: boolean;
    roles?: Snowflake[];
    user?: User;
    require_colons?: boolean;
    managed?: boolean;
    available?: boolean;
};

export type EmojiCreateData = {
    name: string;
    image: ImageData;
    roles: string[];
};

export type EmojiEditData = {
    name?: string;
    roles?: string[];
};

export interface PartialEmoji extends Omit<Emoji, 'id' | 'name'> {
    id?: Snowflake | null;
    name: string | null;
}

/****** sticker types ******/

export type Sticker = {
    id: Snowflake;
    pack_id?: Snowflake;
    name: string;
    description: string;
    tags: string;
    /** @deprecated previously the sticker asset hash, now an empty string */
    asset: '';
    type: num.STICKER_TYPES;
    format_type: num.STICKER_FORMAT_TYPES;
    available?: boolean;
    guild_id?: Snowflake;
    user?: User;
    sort_value?: number;
};

export type StickerItem = {
    id: Snowflake;
    name: string;
    format_type: num.STICKER_FORMAT_TYPES;
};

/************ role types ************/

export type Role = {
    id: Snowflake;
    name: string;
    color: number;
    hoist: boolean;
    icon?: string | null;
    unicode_emoji?: string | null;
    position: number;
    permissions: Bitfield;
    managed: boolean;
    mentionable: boolean;
    tags?: RoleTags;
    flags?: num.ROLE_FLAGS;
};

export type RoleData = {
    name?: string;
    color?: number;
    hoist?: boolean;
    position?: number;
    permissions?: Bitfield;
    managed?: boolean;
    mentionable?: boolean;
};

export type RoleTags = {
    bot_id?: Snowflake;
    integration_id?: Snowflake;
    premium_subscriber?: null;
};

export type RolePositionData = {
    id: Snowflake;
    position?: number | null;
};

/************ member types ************/

export type MemberData = {
    nick?: string;
    roles?: Snowflake[];
    deaf?: boolean;
    mute?: boolean;
    channel_id?: Snowflake | null;
};

export interface PartialMember {
    /** Not included in MESSAGE_CREATE and MESSAGE_UPDATE member objects */
    user?: User;
    nick?: string;
    roles: Snowflake[];
    joined_at: Timestamp;
    premium_since?: Timestamp | null;
    /** member screening, only included in GUILD_* events */
    pending?: boolean;
    /** only provided in Interaction objects; includes overwrites */
    permissions?: Bitfield;
    communication_disabled_until?: Timestamp | null;
    avatar?: string | null;
}

export interface Member extends PartialMember {
    user: User;
    deaf: boolean;
    mute: boolean;
}

/************ channel types ************/

/** for editing only */
export type ChannelData = {
    name?: string;
    nsfw?: boolean;
    rate_limit_per_user?: number;
    bitrate?: number;
    user_limit?: number;
    thread_metadata?: ThreadMeta;
};

export type PartialChannel = {
    id: Snowflake;
    type: num.CHANNEL_TYPES;
    name?: string;
    permissions: Bitfield;
};

export interface Channel extends Omit<PartialChannel, 'permissions'> {
    // guild fields
    guild_id?: Snowflake;
    position?: number;
    parent_id?: Snowflake | null;
    permission_overwrites?: PermissionOverwrites[];

    // dm fields
    recipients?: User[];

    // text fields
    topic?: string | null;
    nsfw: boolean;
    last_message_id?: Snowflake | null;
    rate_limit_per_user?: number;
    last_pin_timestamp?: Timestamp | null;
    default_auto_archive_duration?: number;

    // voice fields
    rtc_region?: VoiceRegion | null;
    bitrate?: number;
    user_limit?: number;
    video_quality_mode?: num.VIDEO_QUALITY_MODES;

    // group dm fields
    /** also used in threads */
    owner_id?: Snowflake;
    application_id?: Snowflake;
    icon?: string | null;

    // thread fields
    thread_metadata?: ThreadMeta;
    member?: ThreadMember;
    message_count?: number;
    member_count?: number;

    // forum fields
    default_reaction_emoji?: DefaultReaction;
    available_tags?: ForumTag[];
    default_sort_order?: number;
    default_forum_layout?: number;
}

export interface GuildChannel extends Channel {
    guild_id: Snowflake;
    name: string;
    position: number;
    recipients: never;
}

export interface DMBasedChannel extends Channel {
    type: num.CHANNEL_TYPES.DM | num.CHANNEL_TYPES.GROUP_DM;
    recipients: User[];
    guild_id: never;
}

export interface TextBasedChannel extends GuildChannel {
    nsfw: boolean;
}

export interface TextChannel extends TextBasedChannel {
    type: num.CHANNEL_TYPES.GUILD_TEXT;
}

export interface DMChannel extends DMBasedChannel {
    type: num.CHANNEL_TYPES.DM;
    owner_id: undefined;
}

export interface VoiceBasedChannel extends GuildChannel {
    type: num.CHANNEL_TYPES.GUILD_VOICE | num.CHANNEL_TYPES.GUILD_STAGE_VOICE;
    rtc_region: VoiceRegion | null;
    bitrate: number;
    user_limit: number;
}

export interface VoiceChannel extends VoiceBasedChannel {
    type: num.CHANNEL_TYPES.GUILD_VOICE;
}

export interface GroupDMChannel extends DMBasedChannel {
    type: num.CHANNEL_TYPES.GROUP_DM;
    owner_id: Snowflake;
    icon: string | null;
}

export interface CategoryChannel extends GuildChannel {
    type: num.CHANNEL_TYPES.GUILD_CATEGORY;
    parent_id: undefined | null;
}

export interface NewsChannel extends TextBasedChannel {
    type: num.CHANNEL_TYPES.GUILD_NEWS;
}

export interface StoreChannel extends TextBasedChannel {
    type: num.CHANNEL_TYPES.GUILD_STORE;
}

export interface ThreadChannel extends GuildChannel {
    type:
        | num.CHANNEL_TYPES.GUILD_NEWS_THREAD
        | num.CHANNEL_TYPES.GUILD_PUBLIC_THREAD
        | num.CHANNEL_TYPES.GUILD_PRIVATE_THREAD;
    thread_metadata: ThreadMeta;
    member: ThreadMember;
    message_count: number;
    member_count: number;
    owner_id: Snowflake;
}

export interface NewsThreadChannel extends ThreadChannel {
    type: num.CHANNEL_TYPES.GUILD_NEWS_THREAD;
}

export interface PublicThreadChannel extends ThreadChannel {
    type: num.CHANNEL_TYPES.GUILD_PUBLIC_THREAD;
}

export interface PrivateThreadChannel extends ThreadChannel {
    type: num.CHANNEL_TYPES.GUILD_PRIVATE_THREAD;
}

export interface VoiceStageChannel extends VoiceBasedChannel {
    type: num.CHANNEL_TYPES.GUILD_STAGE_VOICE;
}

//export type GuildChannel = TextChannel | VoiceChannel | CategoryChannel | NewsChannel | StoreChannel | ThreadChannel | NewsThreadChannel | PublicThreadChannel | VoiceStageChannel;

//export type Channel = GuildChannel | DMChannel |  GroupDMChannel;

export type ThreadMeta = {
    archived: boolean;
    auto_archive_duration: number;
    archive_timestamp: Timestamp;
    locked: boolean;
};

export type ThreadMember = {
    id?: Snowflake;
    user_id?: Snowflake;
    join_timestamp: Timestamp;
    flags: Flags;
};

export type VoiceRegion = {
    id: Snowflake;
    name: string;
    vip: boolean;
    optimal: boolean;
    deprecated: boolean;
    custom: boolean;
};

export type PermissionOverwrites = {
    id: Snowflake;
    type: num.PERMISSION_OVERWRITE_TYPES;
    allow: Bitfield;
    deny: Bitfield;
};

export type ChannelPositionData = {
    id: Snowflake;
    position: number | null;
    lock_permissions?: boolean | null;
    parent_id?: Snowflake | null;
};

// https://discord.com/developers/docs/resources/channel#default-reaction-object
export type DefaultReaction =
    | {
          emoji_id: Snowflake;
      }
    | {
          emoji_name: string;
      };

export type ForumTag = {
    id: Snowflake;
    name: string;
    moderated: boolean;
    emoji_id: Snowflake | null;
    emoji_name: string | null;
};

/************ audit log types ************/

export type AuditLogEntry = {
    target_id: Snowflake | null;
    changes?: AuditLogChange[];
    user_id: Snowflake | null;
    id: Snowflake;
    action_type: num.AUDIT_LOG_ENTRY_TYPES;
    options?: AuditLogEntryInfo;
    reason?: string;
};

export type AuditLogChange = {
    new_value?: unknown;
    old_value?: unknown;
    key: string;
};

export type AuditLogEntryInfo = {
    application_id?: Snowflake;
    auto_moderation_rule_name?: string;
    auto_moderation_rule_trigger_type?: string;
    channel_id?: Snowflake;
    count?: string;
    delete_member_days?: string;
    id?: Snowflake;
    members_removed?: string;
    message_id?: Snowflake;
    role_name?: string;
    type: '0' | '1';
};

/************ integration types ************/

export type Integration = {
    id: Snowflake;
    name: string;
    type: IntegrationType;
    enabled: boolean;
    syncing?: boolean;
    role_id?: Snowflake;
    enable_emoticons?: boolean;
    expire_behavior?: num.INTEGRATION_EXPIRE_BEHAVIORS;
    expire_grace_period?: number;
    user?: User;
    account: IntegrationAccount;
    synced_at?: Timestamp;
    subscriber_count?: number;
    revoked?: boolean;
    application?: IntegrationApplication;
};

export type IntegrationType = 'twitch' | 'youtube' | 'discord';

export type IntegrationAccount = {
    id: string;
    name: string;
};

export type IntegrationApplication = {
    id: Snowflake;
    name: string;
    icon: string | null;
    description: string;
    summary: string;
    bot?: User;
};

/************ interaction types ************/

// https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
export type InteractionBase = {
    id: Snowflake;
    application_id: Snowflake;
    type: num.INTERACTION_REQUEST_TYPES;
    data?: InteractionData;
    token: string;
    version: 1;
    /** only present for component interactions */
    message?: Message;
    app_permissions: Bitfield;
    channel_id?: Snowflake;
    /** User's locale. Not present in ping interactions. */
    locale: Locale;
    entitlements: Entitlement[];
    authorizing_integration_owners: AuthorizingIntegrationOwners;
    context?: num.INTERACTION_CONTEXT_TYPES;
};
export interface GuildInteraction extends InteractionBase {
    guild: PartialGuild;
    guild_id: Snowflake;
    member: Member;
    guild_locale?: Locale;
}
export interface NonGuildInteraction extends InteractionBase {
    user: PartialUser;
}
export type Interaction = GuildInteraction | NonGuildInteraction;

export type InteractionData = {
    id: Snowflake;
    name: string;
    resolved?: InteractionDataResolved;
    options?: InteractionDataOption[];
    custom_id?: string;
    component_type?: num.MESSAGE_COMPONENT_TYPES;
    values?: string[];
    target_id?: Snowflake;
    components?: MessageComponent[];
};

export type InteractionDataResolved = {
    users?: Record<Snowflake, User>;
    members?: Record<Snowflake, PartialMember>;
    roles?: Record<Snowflake, Role>;
    channels?: Record<Snowflake, PartialChannel>;
    messages?: Record<Snowflake, PartialMessage>;
    attachments?: Record<Snowflake, Attachment>;
};

export type InteractionDataOption = {
    name: string;
    type: num.COMMAND_OPTION_TYPES;
    value?: CommandOptionValue;
    options?: InteractionDataOption[];
    /** for autocomplete */
    focused?: boolean;
};

export type InteractionResponse = {
    type: num.INTERACTION_CALLBACK_TYPES;
    data?: InteractionResponseData;
};

export type InteractionMessageResponseData = {
    tts?: boolean;
    content?: string;
    embeds?: Embed[];
    allowed_mentions?: AllowedMentions;
    flags?: num.INTERACTION_CALLBACK_FLAGS | 0;
    components?: MessageComponent[];
};
export type InteractionAutocompleteResponseData = {
    choices: CommandOptionChoice[];
};
export type InteractionModalResponseData = {
    custom_id: string;
    title: string;
    components: MessageComponentRow<TextInput>[];
};
export type InteractionResponseData =
    | InteractionMessageResponseData
    | InteractionAutocompleteResponseData
    | InteractionModalResponseData;

export type MessageInteraction = {
    id: Snowflake;
    type: num.INTERACTION_REQUEST_TYPES;
    name: string;
    user: User;
};

// https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-authorizing-integration-owners-object
export type AuthorizingIntegrationOwners = Record<num.APPLICATION_INTEGRATION_TYPES, Snowflake | '0'>;

/****** application command types ******/

export const LOCALE_LIST = [
    'da', // Danish          Dansk
    'de', // German          Deutsch
    'en-GB', // English, UK
    'en-US', // English, US
    'es-ES', // Spanish         Español
    'fr', // French          Français
    'hr', // Croation        Hrvatski
    'it', // Italian         Italiano
    'lt', // Lithuanian	    Lietuviškai
    'hu', // Hungarian	    Magyar
    'nl', // Dutch	        Nederlands
    'no', // Norwegian	    Norsk
    'pl', // Polish	        Polski
    'pt-BR', // Portuguese, Brazilian	Português do Brasil
    'ro', // Romanian, Romania	    Română
    'fi', // Finnish	        Suomi
    'sv-SE', // Swedish	        Svenska
    'vi', // Vietnamese	    Tiếng Việt
    'tr', // Turkish	        Türkçe
    'cs', // Czech	        Čeština
    'el', // Greek	        Ελληνικά
    'bg', // Bulgarian	    български
    'ru', // Russian	        Pусский
    'uk', // Ukrainian	    Українська
    'hi', // Hindi	        हिन्दी
    'th', // Thai	        ไทย
    'zh-CN', // Chinese, China	中文
    'ja', // Japanese	    日本語
    'zh-TW', // Chinese, Taiwan	繁體中文
    'ko', // Korean	        한국어
] as const;
export type Locale = (typeof LOCALE_LIST)[number];
export type LocaleDict = Partial<Record<Locale, string | string[]>>;

// https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-structure
export type CommandBase = {
    name?: string;
    name_localizations?: LocaleDict;
    description?: string;
    description_localizations?: LocaleDict;
    options?: CommandOption[];
    /** @deprecated */
    default_permission?: boolean;
    default_member_permissions?: Bitfield | null;
    /** @deprecated */
    dm_permission?: boolean | null;
    type?: num.COMMAND_TYPES;
};
export interface CommandCreateData extends CommandBase {
    name: string;
    description: string;
    nsfw?: boolean;
    integration_types?: num.APPLICATION_INTEGRATION_TYPES[];
    contexts?: num.INTERACTION_CONTEXT_TYPES[];
}
export type CommandEditData = Omit<CommandBase, 'type'>;

export interface Command extends CommandCreateData {
    id: Snowflake;
    application_id: Snowflake;
    guild_id?: Snowflake;
    version: Snowflake;
    type: num.COMMAND_TYPES;
}

export type CommandOptionValue = CommandOption | string | number | boolean;

export type CommandOption = {
    type: num.COMMAND_OPTION_TYPES;
    name: string;
    name_localizations?: LocaleDict;
    description: string;
    description_localizations?: LocaleDict;
    required?: boolean;
    choices?: CommandOptionChoice[];
    options?: CommandOption[];
    channel_types?: num.CHANNEL_TYPES[];
    min_value?: number;
    max_value?: number;
    autocomplete?: boolean;
};

export type CommandOptionChoice = {
    name: string;
    name_localizations?: LocaleDict;
    value: string | number;
};

export type CommandPermissions = {
    id: Snowflake;
    application_id: Snowflake;
    guild_id: Snowflake;
    permissions: CommandPermissionsData[];
};

export type CommandPermissionsData = {
    id: Snowflake;
    type: num.COMMAND_PERMISSION_TYPES;
    permission: boolean;
};

/************ message types ************/
// https://discord.com/developers/docs/resources/channel#message-object

export type Message = {
    id: Snowflake;
    channel_id: Snowflake;
    guild_id?: Snowflake;
    author: User | WebhookUser;
    content: string;
    timestamp: Timestamp;
    edited_timestamp: Timestamp | null;
    tts: boolean;
    mention_everyone: boolean;
    mentions: UserMember[];
    mention_roles?: Role[];
    /** only for crossposted messages and for "public" channels */
    mention_channels?: ChannelMention[];
    attachments: Attachment[];
    embeds: Embed[];
    reactions?: Reaction[];
    nonce?: number | string;
    pinned: boolean;
    webhook_id?: Snowflake;
    type: num.MESSAGE_TYPES;
    activity?: MessageActivity;
    application?: Application;
    application_id?: Snowflake;
    message_reference?: MessageReference;
    flags?: num.MESSAGE_FLAGS;
    referenced_message?: Message | null;
    interaction_metadata?: MessageInteractionMetadata;
    interaction?: MessageInteraction;
    thread?: ThreadChannel;
    components?: MessageComponent[];
    sticker_items?: StickerItem[];
    stickers?: Sticker[];
    enforce_nonce?: boolean;
};

interface UserMember extends User {
    member: PartialMember;
}

export type WebhookUser = Pick<User, 'id' | 'username' | 'avatar'>;

// https://discord.com/developers/docs/resources/channel#allowed-mentions-object-allowed-mentions-reference
export type AllowedMentions = {
    parse?: Array<'roles' | 'users' | 'everyone'>;
    roles?: Snowflake[];
    users?: Snowflake[];
    replied_user?: boolean;
};

export type MessageReference = {
    message_id?: Snowflake;
    channel_id?: Snowflake;
    guild_id?: Snowflake;
    fail_if_not_exists?: boolean;
};

// https://discord.com/developers/docs/resources/channel#message-interaction-metadata-object
export type MessageInteractionMetadata = {
    id: Snowflake;
    type: num.INTERACTION_REQUEST_TYPES;
    user: User;
};

export interface PartialMessage extends Partial<Message> {
    id: Snowflake;
}

export type MessageDataAttachment = {
    name: string;
    data: Buffer;
    /** MIME type */
    content_type: string;
};

export interface MessageData
    extends Partial<Pick<Message, 'content' | 'tts' | 'embeds' | 'message_reference' | 'components' | 'flags'>> {
    allowed_mentions?: AllowedMentions;
    sticker_ids?: Snowflake[];
    upload_attachments?: MessageDataAttachment[];
}

export type MessageActivity = {
    type: num.MESSAGE_ACTIVITY_TYPES;
    party_id?: string;
};

export type MessageFetchData = {
    limit: number;
    around?: Snowflake;
    before?: Snowflake;
    after?: Snowflake;
};

// https://discord.com/developers/docs/resources/channel#attachment-object
export type Attachment = {
    id: Snowflake;
    filename: string;
    description?: string;
    /** MIME type */
    content_type?: string;
    size: number;
    url: string;
    proxy_url: string;
    height?: number | null;
    width?: number | null;
    ephemeral?: boolean;
    /** voice messages only */
    duration_secs?: number;
    /** voice messages only */
    waveform?: string;
    flags?: num.ATTACHMENT_FLAGS;
};

export type ChannelMention = {
    id: Snowflake;
    guild_id: Snowflake;
    type: num.CHANNEL_TYPES;
    name: string;
};

/****** message component types ******/

// https://canary.discord.com/developers/docs/interactions/message-components#component-object
export type MessageComponentBase = {
    type: num.MESSAGE_COMPONENT_TYPES;
};
export interface MessageComponentRow<ComponentType extends MessageComponent = MessageComponent>
    extends MessageComponentBase {
    type: num.MESSAGE_COMPONENT_TYPES.ACTION_ROW;
    components: ComponentType[];
}
interface MessageComponentButtonBase extends MessageComponentBase {
    type: num.MESSAGE_COMPONENT_TYPES.BUTTON;
    disabled?: boolean;
}
interface MessageComponentButtonGeneric extends MessageComponentButtonBase {
    disabled?: boolean;
    label?: string;
    emoji?: PartialEmoji;
}
export interface MessageComponentButtonNormal extends MessageComponentButtonGeneric {
    style: num.BUTTON_STYLES_GENERIC;
    custom_id: string;
}
export interface MessageComponentButtonLink extends MessageComponentButtonGeneric {
    style: num.BUTTON_STYLES.LINK;
    url: URL;
}
export interface MessageComponentButtonPremium extends MessageComponentButtonBase {
    style: num.BUTTON_STYLES.PREMIUM;
    sku_id: Snowflake;
}
export type MessageComponentButton =
    | MessageComponentButtonNormal
    | MessageComponentButtonLink
    | MessageComponentButtonPremium;

export interface Select extends MessageComponentBase {
    type:
        | num.MESSAGE_COMPONENT_TYPES.CHANNEL_SELECT
        | num.MESSAGE_COMPONENT_TYPES.MENTIONABLE_SELECT
        | num.MESSAGE_COMPONENT_TYPES.ROLE_SELECT
        | num.MESSAGE_COMPONENT_TYPES.STRING_SELECT
        | num.MESSAGE_COMPONENT_TYPES.USER_SELECT;
    custom_id: string;
    disabled?: boolean;
    placeholder?: string;
    min_values?: number;
    max_values?: number;
    default_values?: SelectDefaultValue[];
}
export interface TextSelect extends Select {
    type: num.MESSAGE_COMPONENT_TYPES.STRING_SELECT;
    options: SelectOption[];
}
export interface ChannelSelect extends Select {
    type: num.MESSAGE_COMPONENT_TYPES.CHANNEL_SELECT;
    channel_types: num.CHANNEL_TYPES[];
}
export interface SelectDefaultValue {
    id: Snowflake;
    type: 'user' | 'role' | 'channel';
}
export interface TextInput extends MessageComponentBase {
    type: num.MESSAGE_COMPONENT_TYPES.TEXT_INPUT;
    custom_id: string;
    style: num.TEXT_INPUT_STYLES;
    label: string;
    min_length?: number;
    max_length?: number;
    required?: boolean;
    value?: string;
    placeholder?: string;
}
export type SelectOption = {
    label: string;
    value: string;
    description?: string;
    emoji?: PartialEmoji;
    default?: boolean;
};
export type MessageComponent =
    | MessageComponentRow
    | MessageComponentButton
    | Select
    | TextSelect
    | ChannelSelect
    | TextInput;

/****** embed types ******/

export type Embed = {
    title?: string;
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
};

export type EmbedFooter = {
    text: string;
    icon_url?: URL;
    proxy_icon_url?: URL;
};
export type EmbedMedia = {
    url: URL;
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

/************ application types ************/
// https://discord.com/developers/docs/resources/application#application-object

export type Application = {
    id: Snowflake;
    name: string;
    icon: string | null;
    description: string;
    rpc_origins?: string[];
    bot_public: boolean;
    bot_require_code_grant: boolean;
    terms_of_service_url?: string;
    privacy_policy_url?: string;
    owner?: PartialUser;
    verify_key: string;
    team: ApplicationTeam | null;
    guild_id?: Snowflake;
    primary_sku_id?: Snowflake;
    slug?: string;
    cover_image?: string;
    flags?: num.APPLICATION_FLAGS;
    approximate_guild_count?: number;
    tags?: string[];
    install_params?: ApplicationInstallParams;
    custom_install_url?: URL;
    role_connections_verification_url?: URL;
    integration_types_config?: Record<num.APPLICATION_INTEGRATION_TYPES, InstallParamsWrapper>;
};

export type PartialApplication = Pick<Application, 'id' | 'flags'>;

type InstallParamsWrapper = {
    oauth2_install_params: ApplicationInstallParams;
};
export type ApplicationInstallParams = {
    scopes: string[];
    permissions: string;
};

export type ApplicationTeam = {
    icon: string | null;
    id: Snowflake;
    members: ApplicationTeamMember[];
    name: string;
    owner_user_id: Snowflake;
};

export type ApplicationTeamMember = {
    membership_state: num.TEAM_MEMBERSHIP_STATE;
    permissions: ['*'];
    team_id: Snowflake;
    user: PartialUser;
};

/************ automod types ************/

export type AutoModRuleData = {
    name: string;
    event_type: num.AUTOMOD_EVENT_TYPES;
    trigger_type: num.AUTOMOD_TRIGGER_TYPES;
    trigger_metadata?: AutoModTriggerMetadata;
    actions: AutoModAction[];
    enabled?: boolean;
    exempt_roles?: Snowflake[];
    exempt_channels?: Snowflake[];
};

export type AutoModRuleEditData = Partial<AutoModRuleData>;

export interface AutoModRule extends AutoModRuleData {
    id: Snowflake;
    guild_id: Snowflake;
    creator_id: Snowflake;
    trigger_metadata: AutoModTriggerMetadata;
    enabled: boolean;
    exempt_roles: Snowflake[];
    exempt_channels: Snowflake[];
}

type AutoModTriggerMetadata = {
    keyword_filter: string[];
    regex_patterns: string[];
    presets: num.AUTOMOD_KEYWORD_PRESET_TYPES;
    allow_list: string[];
    mention_total_limit: number;
};

export type AutoModAction = {
    type: num.AUTOMOD_ACTION_TYPES;
    metadata?: AutoModActionMetadata;
};

type AutoModActionMetadata = {
    channel_id?: Snowflake;
    /** maximum of 2419200 seconds (4 weeks) */
    duration_seconds?: number;
    /** maximum of 150 characters */
    custom_message?: string;
};

/************ invite types ************/

export type Invite = {
    code: string;
    guild?: PartialGuild;
    channel: PartialChannel | null;
    inviter?: User;
    target_type?: number;
    target_user?: User;
    target_application?: PartialApplication;
    /** only appears when ?with_counts=true */
    approximate_presence_count?: number;
    /** only appears when ?with_counts=true */
    approximate_member_count?: number;
    /** only appears when ?with_expiration=true */
    expires_at?: Timestamp | null;
    /** only appears when using ?guild_scheduled_event_id=<id> */
    guild_scheduled_event?: GuildScheduledEvent;
};

export interface ExtendedInvite extends Invite {
    uses: number;
    max_uses: number;
    max_age: number;
    temporary: boolean;
    created_at: Timestamp;
}

/************ entitlement types ************/
// https://discord.com/developers/docs/monetization/entitlements#entitlement-object

export type Entitlement = {
    id: Snowflake;
    sku_id: Snowflake;
    application_id: Snowflake;
    user_id?: Snowflake;
    type: num.ENTITLEMENT_TYPES;
    deleted: boolean;
    starts_at?: Timestamp;
    ends_at?: Timestamp;
    guild_id?: Snowflake;
    consumed?: boolean;
};

/************ misc types ************/

export type HTTPMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH';

export type LangMap = { [key: string]: Lang };

export type Lang = Record<string, string | string[]>;

export type ReplaceMap = Record<string, string | number>;

/****** special dev types ******/

export type CustomEmojiIdentifier = `${string}:${Snowflake}`;

export type UnicodeEmoji = string;

// formatted as name:id (i.e. ) or Unicode emoji (i.e. 🔥)
export type EmojiIdentifier = CustomEmojiIdentifier | UnicodeEmoji;

/** ISO8601 timestamp */
export type Timestamp = `${number}-${number}-${number}T${number}:${number}:${number}.${number}Z`;

/** bitfield number represented as string */
export type Bitfield = `${number | bigint}`;

/** bitfield number represented as number */
export type Flags = number;

/** URI encoded image */
export type ImageData = `data:image/${'jpeg' | 'png' | 'gif'};base64,${string}`;

/** Any kind of URL */
export type URL = `${string}://${string}`;

/** Discord Snowflake, 18-20 digits */
export type Snowflake = `${number | bigint}`;

export type SnowflakeOrMe = Snowflake | '@me';

/** Unix timestamp (seconds since epoch) */
export type UnixTimestamp = number;

/** Unix timestamp (millis since epoch) */
export type UnixTimestampMillis = number;

// https://discord.com/developers/docs/reference#message-formatting-timestamp-styles
export const TIMESTAMP_FORMATS = ['t', 'T', 'd', 'D', 'f', 'F', 'R'] as const;
export type TimestampFormat = (typeof TIMESTAMP_FORMATS)[number];

/** what Command.run() can return. may add more types later. */
export type CommandResponse = Promise<Message | null>;

export type StringMap = Record<string, string>;

// Used for objects with optional fields (namely users for redis cache.) This is just a workaround to get the compiler to play nice; shouldn't be used to manually set fields to undefined.
export type DynamicStringMap = Partial<StringMap>;

export type StringBool = 'true' | 'false';

export type StringNum = `${number}`;

export type TimeoutList = {
    gatewayError: NodeJS.Timeout[];
};

/*** event handler types ***/

export type EventHandlerFunction<T extends EventData> = (event: T) => void;

export class EventHandler<T extends EventData> {
    bot: Bot;
    name: EventName;
    requiresReady = false; // TODO: for production use, default should be true

    cacheHandler?: EventHandlerFunction<T>;
    handler!: EventHandlerFunction<T>;

    constructor(eventName: LowercaseEventName, bot: Bot) {
        this.name = eventName.toUpperCase() as EventName;
        this.bot = bot;
    }
}

/*** permission types ***/

export type PermissionName = keyof typeof num.PERMISSIONS;

export type BenderPermission = RoleHierarchyPermission | RoleListPermission | DiscordPermission;

export type RoleHierarchyPermission = Snowflake;
export type RoleListPermission = Snowflake[];
export type DiscordPermission = PermissionName;
