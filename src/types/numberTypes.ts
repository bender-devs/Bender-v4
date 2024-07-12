// https://discord.com/developers/docs/resources/user#user-object-user-flags
export const enum USER_FLAGS {
    STAFF = 1 << 0,
    PARTNER = 1 << 1,
    HYPESQUAD = 1 << 2,
    BUG_HUNTER_LEVEL_1 = 1 << 3,
    HYPESQUAD_ONLINE_HOUSE_1 = 1 << 6,
    HYPESQUAD_ONLINE_HOUSE_2 = 1 << 7,
    HYPESQUAD_ONLINE_HOUSE_3 = 1 << 8,
    PREMIUM_EARLY_SUPPORTER = 1 << 9,
    TEAM_PSEUDO_USER = 1 << 10,
    BUG_HUNTER_LEVEL_2 = 1 << 14,
    VERIFIED_BOT = 1 << 16,
    VERIFIED_DEVELOPER = 1 << 17,
    CERTIFIED_MODERATOR = 1 << 18,
    BOT_HTTP_INTERACTIONS = 1 << 19,
    ACTIVE_DEVELOPER = 1 << 22,
}

// https://discord.com/developers/docs/resources/user#user-object-premium-types
export const enum PREMIUM_TYPES {
    NONE,
    NITRO_CLASSIC,
    NITRO,
}

// https://discord.com/developers/docs/topics/gateway#activity-object-activity-types
export enum ACTIVITY_TYPES {
    PLAYING,
    STREAMING,
    LISTENING,
    WATCHING,
    CUSTOM,
    COMPETING,
}

// https://discord.com/developers/docs/topics/permissions#role-object-role-flags
export const enum ROLE_FLAGS {
    IN_PROMPT = 1 << 0,
}

// https://discord.com/developers/docs/resources/channel#attachment-object-attachment-flags
export const enum ATTACHMENT_FLAGS {
    IS_REMIX = 1 << 2,
}

// https://discord.com/developers/docs/resources/guild#guild-onboarding-object-onboarding-mode
export const enum ONBOARDING_MODES {
    DEFAULT,
    ADVANCED,
}

// https://discord.com/developers/docs/resources/guild#guild-onboarding-object-prompt-types
export const enum ONBOARDING_PROMPT_TYPES {
    MULTIPLE_CHOICE,
    DROPDOWN,
}

// https://discord.com/developers/docs/resources/guild#guild-object-default-message-notification-level
export const enum MESSAGE_NOTIFICATION_LEVELS {
    ALL_MESSAGES,
    ONLY_MENTIONS,
}

// https://discord.com/developers/docs/resources/guild#guild-object-explicit-content-filter-level
export const enum EXPLICIT_FILTER_LEVELS {
    DISABLED,
    MEMBERS_WITHOUT_ROLES,
    ALL_MEMBERS,
}

// https://discord.com/developers/docs/resources/guild#guild-object-mfa-level
export const enum MFA_LEVELS {
    NONE,
    ELEVATED,
}

// https://discord.com/developers/docs/resources/guild#guild-object-verification-level
export const enum VERIFICATION_LEVELS {
    NONE,
    LOW,
    MEDIUM,
    HIGH,
    VERY_HIGH,
}

// https://discord.com/developers/docs/resources/guild#guild-object-guild-nsfw-level
export const enum NSFW_LEVELS {
    DEFAULT,
    EXPLICIT,
    SAFE,
    AGE_RESTRICTED,
}

// https://discord.com/developers/docs/resources/guild#guild-object-premium-tier
export const enum PREMIUM_TIERS {
    NONE,
    LOW,
    MEDIUM,
    HIGH,
    VERY_HIGH,
}

// https://discord.com/developers/docs/resources/channel#message-object-message-types
export const enum MESSAGE_TYPES {
    DEFAULT,
    RECIPIENT_ADD,
    RECIPIENT_REMOVE,
    CALL,
    CHANNEL_NAME_CHANGE,
    CHANNEL_ICON_CHANGE,
    CHANNEL_PINNED_MESSAGE,
    GUILD_MEMBER_JOIN,
    USER_PREMIUM_GUILD_SUBSCRIPTION,
    USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_1,
    USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_2,
    USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_3,
    CHANNEL_FOLLOW_ADD,
    GUILD_DISCOVERY_DISQUALIFIED,
    GUILD_DISCOVERY_REQUALIFIED,
    GUILD_DISCOVERY_GRACE_PERIOD_INITIAL_WARNING,
    GUILD_DISCOVERY_GRACE_PERIOD_FINAL_WARNING,
    THREAD_CREATED,
    REPLY,
    CHAT_INPUT_COMMAND,
    THREAD_STARTER_MESSAGE,
    GUILD_INVITE_REMINDER,
    CONTEXT_MENU_COMMAND,
}

// https://discord.com/developers/docs/resources/channel#message-object-message-activity-types
export const enum MESSAGE_ACTIVITY_TYPES {
    JOIN = 1,
    SPECTATE,
    LISTEN,
    JOIN_REQUEST = 5,
}

// https://discord.com/developers/docs/resources/channel#message-object-message-flags
export const enum MESSAGE_FLAGS {
    CROSSPOSTED = 1 << 0,
    IS_CROSSPOST = 1 << 1,
    SUPPRESS_EMBEDS = 1 << 2,
    SOURCE_MESSAGE_DELETED = 1 << 3,
    URGENT = 1 << 4,
    HAS_THREAD = 1 << 5,
    EPHEMERAL = 1 << 6,
    LOADING = 1 << 7,
    FAILED_TO_MENTION_SOME_ROLES_IN_THREAD = 1 << 8,
}

// https://discord.com/developers/docs/resources/poll#layout-type
export const enum POLL_LAYOUT_TYPES {
    DEFAULT = 1,
}

// https://discord.com/developers/docs/resources/guild#guild-object-system-channel-flags
export const enum SYSTEM_CHANNEL_FLAGS {
    SUPPRESS_JOIN_NOTIFICATIONS = 1 << 0,
    SUPPRESS_PREMIUM_SUBSCRIPTIONS = 1 << 1,
    SUPPRESS_GUILD_REMINDER_NOTIFICATIONS = 1 << 2,
}

// https://discord.com/developers/docs/resources/stage-instance#stage-instance-object-privacy-level
export const enum STAGE_PRIVACY_LEVELS {
    PUBLIC = 1,
    GUILD_ONLY,
}

// https://discord.com/developers/docs/resources/channel#channel-object-channel-types
export const enum CHANNEL_TYPES {
    GUILD_TEXT,
    DM,
    GUILD_VOICE,
    GROUP_DM,
    GUILD_CATEGORY,
    GUILD_NEWS,
    GUILD_STORE,
    GUILD_NEWS_THREAD = 10,
    GUILD_PUBLIC_THREAD,
    GUILD_PRIVATE_THREAD,
    GUILD_STAGE_VOICE,
    GUILD_DIRECTORY,
    GUILD_FORUM,
}

// https://discord.com/developers/docs/resources/channel#channel-object-video-quality-modes
export const enum VIDEO_QUALITY_MODES {
    AUTO = 1,
    FULL,
}

// https://discord.com/developers/docs/resources/channel#edit-channel-permissions-json-params
export const enum PERMISSION_OVERWRITE_TYPES {
    ROLE,
    MEMBER,
}

// https://discord.com/developers/docs/resources/sticker#sticker-object-sticker-types
export const enum STICKER_TYPES {
    STANDARD = 1,
    GUILD,
}

// https://discord.com/developers/docs/resources/sticker#sticker-object-sticker-format-types
export const enum STICKER_FORMAT_TYPES {
    PNG = 1,
    APNG,
    LOTTIE,
}

// https://discord.com/developers/docs/resources/guild#integration-object-integration-expire-behaviors
export const enum INTEGRATION_EXPIRE_BEHAVIORS {
    REMOVE_ROLE,
    KICK,
}

// https://discord.com/developers/docs/interactions/slash-commands#interaction-object-interaction-request-type
export const enum INTERACTION_REQUEST_TYPES {
    PING = 1,
    APPLICATION_COMMAND,
    MESSAGE_COMPONENT,
    APPLICATION_COMMAND_AUTOCOMPLETE,
    MODAL_SUBMIT,
}

// https://discord.com/developers/docs/interactions/slash-commands#interaction-response-object-interaction-callback-type
export const enum INTERACTION_CALLBACK_TYPES {
    PONG = 1,
    CHANNEL_MESSAGE_WITH_SOURCE = 4,
    DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
    DEFERRED_UPDATE_MESSAGE,
    UPDATE_MESSAGE,
    APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
    MODAL,
    /** @deprecated */
    PREMIUM_REQUIRED,
}

// https://discord.com/developers/docs/interactions/slash-commands#interaction-response-object-interaction-application-command-callback-data-flags
export const enum INTERACTION_CALLBACK_FLAGS {
    SUPPRESS_EMBEDS = 1 << 2,
    EPHEMERAL = 1 << 6,
}

// https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-context-types
export const enum INTERACTION_CONTEXT_TYPES {
    GUILD = 0,
    /** DM between user and bot */
    BOT_DM,
    /** Group DM or DM between users */
    PRIVATE_CHANNEL,
}

// https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-types
export const enum COMMAND_TYPES {
    CHAT_INPUT = 1,
    USER,
    MESSAGE,
}

// https://discord.com/developers/docs/interactions/slash-commands#application-command-object-application-command-option-type
export const enum COMMAND_OPTION_TYPES {
    SUB_COMMAND = 1,
    SUB_COMMAND_GROUP,
    STRING,
    INTEGER,
    BOOLEAN,
    USER,
    CHANNEL,
    ROLE,
    MENTIONABLE,
    NUMBER,
    ATTACHMENT,
}

// https://discord.com/developers/docs/interactions/slash-commands#applicationcommandpermissiontype
export const enum COMMAND_PERMISSION_TYPES {
    ROLE = 1,
    USER,
    CHANNEL,
}

// https://discord.com/developers/docs/interactions/message-components#component-object-component-types
export const enum MESSAGE_COMPONENT_TYPES {
    ACTION_ROW = 1,
    BUTTON,
    STRING_SELECT,
    TEXT_INPUT,
    USER_SELECT,
    ROLE_SELECT,
    /** users and roles */
    MENTIONABLE_SELECT,
    CHANNEL_SELECT,
}

// https://discord.com/developers/docs/interactions/message-components#button-object-button-styles
export const enum BUTTON_STYLES_GENERIC {
    PRIMARY = 1,
    SECONDARY,
    SUCCESS,
    DANGER,
}
export const enum BUTTON_STYLES {
    PRIMARY = 1,
    SECONDARY,
    SUCCESS,
    DANGER,
    LINK,
    PREMIUM,
}

// https://discord.com/developers/docs/interactions/message-components#text-input-object-text-input-styles
export const enum TEXT_INPUT_STYLES {
    SHORT = 1,
    PARAGRAPH,
}

// https://discord.com/developers/docs/resources/application#application-object-application-flags
export const enum APPLICATION_FLAGS {
    APPLICATION_AUTO_MODERATION_RULE_CREATE_BADGE = 1 << 6,
    GATEWAY_PRESENCE = 1 << 12,
    GATEWAY_PRESENCE_LIMITED = 1 << 13,
    GATEWAY_GUILD_MEMBERS = 1 << 14,
    GATEWAY_GUILD_MEMBERS_LIMITED = 1 << 15,
    VERIFICATION_PENDING_GUILD_LIMIT = 1 << 16,
    EMBEDDED = 1 << 17,
    GATEWAY_MESSAGE_CONTENT = 1 << 18,
    GATEWAY_MESSAGE_CONTENT_LIMITED = 1 << 19,
    APPLICATION_COMMAND_BADGE = 1 << 23,
}

// https://discord.com/developers/docs/resources/application#application-object-application-integration-types
export const enum APPLICATION_INTEGRATION_TYPES {
    GUILD_INSTALL = '0',
    USER_INSTALL = '1',
}

// https://discord.com/developers/docs/topics/teams#data-models-membership-state-enum
export const enum TEAM_MEMBERSHIP_STATE {
    INVITED = 1,
    ACCEPTED,
}

// https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-privacy-level
export const enum GUILD_SCHEDULED_EVENT_PRIVACY_LEVEL {
    GUILD_ONLY = 2,
}

// https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-entity-types
export const enum GUILD_SCHEDULED_EVENT_ENTITY_TYPES {
    STAGE_INSTANCE = 1,
    VOICE,
    EXTERNAL,
}

// https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-status
export const enum GUILD_SCHEDULED_EVENT_STATUS {
    SCHEDULED = 1,
    ACTIVE,
    COMPLETED,
    CANCELED,
}

// https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-trigger-types
export const enum AUTOMOD_TRIGGER_TYPES {
    KEYWORD = 1,
    SPAM = 3,
    KEYWORD_PRESET,
    MENTION_SPAM,
    MEMBER_PROFILE,
}

// https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-keyword-preset-types
export const enum AUTOMOD_KEYWORD_PRESET_TYPES {
    PROFANITY = 1,
    SEXUAL_CONTENT,
    SLURS,
}

// https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-event-types
export const enum AUTOMOD_EVENT_TYPES {
    MESSAGE_SEND = 1,
    MEMBER_UPDATE,
}

// https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-action-object-action-types
export const enum AUTOMOD_ACTION_TYPES {
    BLOCK_MESSAGE = 1,
    SEND_ALERT_MESSAGE,
    TIMEOUT,
    BLOCK_MEMBER_INTERACTION,
}

// https://discord.com/developers/docs/resources/audit-log#audit-log-entry-object-audit-log-events
export const enum AUDIT_LOG_ENTRY_TYPES {
    GUILD_UPDATE = 1,
    CHANNEL_CREATE = 10,
    CHANNEL_UPDATE,
    CHANNEL_DELETE,
    CHANNEL_OVERWRITE_CREATE,
    CHANNEL_OVERWRITE_UPDATE,
    CHANNEL_OVERWRITE_DELETE,
    MEMBER_KICK = 20,
    MEMBER_PRUNE,
    MEMBER_BAN_ADD,
    MEMBER_BAN_REMOVE,
    MEMBER_UPDATE,
    MEMBER_ROLE_UPDATE,
    MEMBER_MOVE,
    MEMBER_DISCONNECT,
    BOT_ADD,
    ROLE_CREATE = 30,
    ROLE_UPDATE,
    ROLE_DELETE,
    INVITE_CREATE = 40,
    INVITE_UPDATE,
    INVITE_DELETE,
    WEBHOOK_CREATE = 50,
    WEBHOOK_UPDATE,
    WEBHOOK_DELETE,
    EMOJI_CREATE = 60,
    EMOJI_UPDATE,
    EMOJI_DELETE,
    MESSAGE_DELETE = 72,
    MESSAGE_BULK_DELETE,
    MESSAGE_PIN,
    MESSAGE_UNPIN,
    INTEGRATION_CREATE = 80,
    INTEGRATION_UPDATE,
    INTEGRATION_DELETE,
    STAGE_INSTANCE_CREATE,
    STAGE_INSTANCE_UPDATE,
    STAGE_INSTANCE_DELETE,
    STICKER_CREATE = 90,
    STICKER_UPDATE,
    STICKER_DELETE,
    GUILD_SCHEDULED_EVENT_CREATE = 100,
    GUILD_SCHEDULED_EVENT_UPDATE,
    GUILD_SCHEDULED_EVENT_DELETE,
    THREAD_CREATE = 110,
    THREAD_UPDATE,
    THREAD_DELETE,
    APPLICATION_COMMAND_PERMISSION_UPDATE = 121,
    AUTO_MODERATION_RULE_CREATE = 140,
    AUTO_MODERATION_RULE_UPDATE,
    AUTO_MODERATION_RULE_DELETE,
    AUTO_MODERATION_BLOCK_MESSAGE,
    AUTO_MODERATION_FLAG_TO_CHANNEL,
    AUTO_MODERATION_USER_COMMUNICATION_DISABLED,
    CREATOR_MONETIZATION_REQUEST_CREATED = 150,
    CREATOR_MONETIZATION_TERMS_ACCEPTED,
}

// https://discord.com/developers/docs/monetization/entitlements#entitlement-object-entitlement-types
export const enum ENTITLEMENT_TYPES {
    PURCHASE = 1,
    PREMIUM_SUBSCRIPTION,
    DEVELOPER_GIFT,
    TEST_MODE_PURCHASE,
    FREE_PURCHASE,
    PREMIUM_PURCHASE,
    APPLICATION_SUBSCRIPTION,
}

// https://discord.com/developers/docs/topics/opcodes-and-status-codes#gateway-gateway-opcodes
export const enum GATEWAY_OPCODES {
    /** Receive only */
    DISPATCH,
    /** Send/Receive */
    HEARTBEAT,
    /** Send only */
    IDENTIFY,
    /** Send only */
    PRESENCE_UPDATE,
    /** Send only */
    VOICE_STATE_UPDATE,
    /** Send only */
    RESUME = 6,
    /** Receive only */
    RECONNECT,
    /** Send only */
    REQUEST_GUILD_MEMBERS,
    /** Receive only */
    INVALID_SESSION,
    /** Receive only */
    HELLO,
    /** Receive only */
    HEARTBEAT_ACK,
}

// https://discord.com/developers/docs/topics/gateway#gateway-intents
export const enum INTENT_FLAGS {
    GUILDS = 1 << 0,
    GUILD_MEMBERS = 1 << 1,
    GUILD_MODERATION = 1 << 2,
    GUILD_EMOJIS_AND_STICKERS = 1 << 3,
    GUILD_INTEGRATIONS = 1 << 4,
    GUILD_WEBHOOKS = 1 << 5,
    GUILD_INVITES = 1 << 6,
    GUILD_VOICE_STATES = 1 << 7,
    GUILD_PRESENCES = 1 << 8,
    GUILD_MESSAGES = 1 << 9,
    GUILD_MESSAGE_REACTIONS = 1 << 10,
    GUILD_MESSAGE_TYPING = 1 << 11,
    DIRECT_MESSAGES = 1 << 12,
    DIRECT_MESSAGE_REACTIONS = 1 << 13,
    DIRECT_MESSAGE_TYPING = 1 << 14,
    MESSAGE_CONTENT = 1 << 15,
    GUILD_SCHEDULED_EVENTS = 1 << 16,
}

// https://discord.com/developers/docs/topics/gateway#gateways-gateway-versions
export const enum GATEWAY_VERSIONS {
    CURRENT = 9,
}

// used internally to determine gateway connection state
export const enum CLIENT_STATE {
    ALIVE,
    CONNECTING,
    RECONNECTING,
    WAITING,
    DEAD,
}

// https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags
// exported as an object since BigInts are not allowed in enums
// see https://github.com/microsoft/TypeScript/issues/37783
export const PERMISSIONS = {
    CREATE_INSTANT_INVITE: 1n << 0n,
    KICK_MEMBERS: 1n << 1n,
    BAN_MEMBERS: 1n << 2n,
    ADMINISTRATOR: 1n << 3n,
    MANAGE_CHANNELS: 1n << 4n,
    MANAGE_GUILD: 1n << 5n,
    ADD_REACTIONS: 1n << 6n,
    VIEW_AUDIT_LOG: 1n << 7n,
    PRIORITY_SPEAKER: 1n << 8n,
    STREAM: 1n << 9n,
    VIEW_CHANNEL: 1n << 10n,
    SEND_MESSAGES: 1n << 11n,
    SEND_TTS_MESSAGES: 1n << 12n,
    MANAGE_MESSAGES: 1n << 13n,
    EMBED_LINKS: 1n << 14n,
    ATTACH_FILES: 1n << 15n,
    READ_MESSAGE_HISTORY: 1n << 16n,
    MENTION_EVERYONE: 1n << 17n,
    USE_EXTERNAL_EMOJIS: 1n << 18n,
    VIEW_GUILD_INSIGHTS: 1n << 19n,
    CONNECT: 1n << 20n,
    SPEAK: 1n << 21n,
    MUTE_MEMBERS: 1n << 22n,
    DEAFEN_MEMBERS: 1n << 23n,
    MOVE_MEMBERS: 1n << 24n,
    USE_VAD: 1n << 25n,
    CHANGE_NICKNAME: 1n << 26n,
    MANAGE_NICKNAMES: 1n << 27n,
    MANAGE_ROLES: 1n << 28n,
    MANAGE_WEBHOOKS: 1n << 29n,
    MANAGE_EXPRESSIONS: 1n << 30n,
    USE_APPLICATION_COMMANDS: 1n << 31n,
    REQUEST_TO_SPEAK: 1n << 32n,
    MANAGE_EVENTS: 1n << 33n,
    MANAGE_THREADS: 1n << 34n,
    CREATE_PUBLIC_THREADS: 1n << 35n,
    CREATE_PRIVATE_THREADS: 1n << 36n,
    USE_EXTERNAL_STICKERS: 1n << 37n,
    SEND_MESSAGES_IN_THREADS: 1n << 38n,
    USE_EMBEDDED_ACTIVITIES: 1n << 39n,
    MODERATE_MEMBERS: 1n << 40n,
    VIEW_CREATOR_MONETIZATION_ANALYTICS: 1n << 41n,
    USE_SOUNDBOARD: 1n << 42n,
    CREATE_GUILD_EXPRESSIONS: 1n << 43n,
    CREATE_EVENTS: 1n << 44n,
    USE_EXTERNAL_SOUNDS: 1n << 45n,
    SEND_VOICE_MESSAGES: 1n << 46n,
    SEND_POLLS: 1n << 49n,
    USE_EXTERNAL_APPS: 1n << 50n,
};

export const ALL_PERMISSIONS = 0b1111111111111111111111111111111111111111; // 40 digits

// https://discord.com/developers/docs/topics/opcodes-and-status-codes#gateway-gateway-close-event-codes
export const enum GATEWAY_ERRORS {
    UNKNOWN_ERROR = 4000,
    UNKNOWN_OPCODE,
    DECODE_ERROR,
    NOT_AUTHENTICATED,
    AUTHENTICATION_FAILED,
    ALREADY_AUTHENTICATED,
    INVALID_SEQUENCE_NUMBER,
    RATE_LIMITED,
    SESSION_TIMED_OUT,
    INVALID_SHARD,
    SHARDING_REQUIRED,
    INVALID_VERSION,
    INVALID_INTENTS,
    DISALLOWED_INTENTS,
}

// additional disconnect codes for client-side disconnects
export const enum CUSTOM_GATEWAY_ERRORS {
    RECONNECT_REQUESTED = 4997,
    INVALID_SESSION,
    HEARTBEAT_TIMEOUT,
}

// consistent source of time units
export const enum DURATION_UNITS {
    SECOND = 1000,
    MINUTE = 1000 * 60,
    HOUR = 1000 * 60 * 60,
    DAY = 1000 * 60 * 60 * 24,
    WEEK = 1000 * 60 * 60 * 24 * 7,
    MONTH = 1000 * 60 * 60 * 24 * 30,
    YEAR = 1000 * 60 * 60 * 24 * 365,
}

// https://discord.com/developers/docs/topics/opcodes-and-status-codes#json-json-error-codes
export const enum API_ERRORS {
    GENERAL_ERROR,

    UNKNOWN_ACCOUNT = 10001,
    UNKNOWN_APPLICATION,
    UNKNOWN_CHANNEL,
    UNKNOWN_GUILD,
    UNKNOWN_INTEGRATION,
    UNKNOWN_INVITE,
    UNKNOWN_MEMBER,
    UNKNOWN_MESSAGE,
    UNKNOWN_PERMISSION_OVERWRITE,
    UNKNOWN_PROVIDER,
    UNKNOWN_ROLE,
    UNKNOWN_TOKEN,
    UNKNOWN_USER,
    UNKNOWN_EMOJI,
    UNKNOWN_WEBHOOK,
    UNKNOWN_WEBHOOK_SERVICE,

    UNKNOWN_SESSION = 10020,

    UNKNOWN_BAN = 10026,
    UNKNOWN_SKU,
    UNKNOWN_STORE_LISTING,
    UNKNOWN_ENTITLEMENT,
    UNKNOWN_BUILD,
    UNKNOWN_LOBBY,
    UNKNOWN_BRANCH,
    UNKNOWN_STORE_DIRECTORY_LAYOUT,

    UNKNOWN_REDISTRIBUTABLE = 10036,

    UNKNOWN_GIFT_CODE = 10038,

    UNKNOWN_STREAM = 10049,
    UNKNOWN_PREMIUM_SERVER_SUBSCRIBE_COOLDOWN,

    UNKNOWN_GUILD_TEMPLATE = 10057,

    UNKNOWN_DISCOVERABLE_SERVER_CATEGORY = 10059,
    UNKNOWN_STICKER,

    UNKNOWN_INTERACTION = 10062,
    UNKNOWN_APPLICATION_COMMAND,

    UNKNOWN_APPLICATION_COMMAND_PERMISSIONS = 10066,
    UNKNOWN_STAGE_INSTANCE,
    UNKNOWN_GUILD_MEMBER_VERIFICATION_FORM,
    UNKNOWN_GUILD_WELCOME_SCREEN,
    UNKNOWN_GUILD_SCHEDULED_EVENT,
    UNKNOWN_GUILD_SCHEDULED_EVENT_USER,

    BOTS_CANNOT_USE_ENDPOINT = 20001,
    ONLY_BOTS_CAN_USE_ENDPOINT,

    EXPLICIT_CONTENT_CANNOT_BE_SENT = 20009,

    APPLICATION_ACTION_UNAUTHORIZED = 20012,

    ACTION_BLOCKED_DUE_TO_SLOWMODE = 20016,

    ACCOUNT_OWNER_ONLY = 20018,

    ANNOUNCEMENT_EDIT_LIMIT_EXCEEDED = 20022,

    CHANNEL_SEND_RATE_LIMIT = 20028,

    STAGE_GUILD_CONTAINS_DISALLOWED_WORDS = 20031,

    GUILD_PREMIUM_LEVEL_TOO_LOW = 20035,

    MAXIMUM_GUILDS_REACHED = 30001,
    MAXIMUM_FRIENDS_REACHED,
    MAXIMUM_PINS_REACHED,
    MAXIMUM_RECIPIENTS_REACHED,
    MAXIMUM_ROLES_REACHED,

    MAXIMUM_WEBHOOKS_REACHED = 30007,
    MAXIMUM_EMOJIS_REACHED,

    MAXIMUM_REACTIONS_REACHED = 30010,

    MAXIMUM_CHANNELS_REACHED = 30013,

    MAXIMUM_ATTACHMENTS_REACHED = 30015,
    MAXIMUM_INVITES_REACHED,

    MAXIMUM_ANIMATED_EMOJIS_REACHED = 30018,
    MAXIMUM_MEMBERS_REACHED,

    MAXIMUM_CATEGORIES_REACHED = 30030,

    GUILD_TEMPLATE_EXISTS = 30031,

    MAXIMUM_THREAD_PARTICIPANTS = 30033,

    MAXIMUM_BANS_EXCEEDED = 30035,

    MAXIMUM_BAN_FETCHES_REACHED = 30037,

    MAXIMUM_STICKERS_REACHED = 30039,
    MAXIMUM_PRUNE_REQUESTS_REACHED,

    UNAUTHORIZED = 40001,
    VERIFY_YOUR_ACCOUNT,
    OPENING_DIRECT_MESSAGES_TOO_FAST,

    REQUEST_ENTITY_TOO_LARGE = 40005,
    FEATURE_TEMPORARILY_DISABLED,
    USER_BANNED_FROM_GUILD,

    USER_NOT_CONNECTED_TO_VOICE = 40032,
    MESSAGE_ALREADY_CROSSPOSTED,

    APPLICATION_COMMAND_EXISTS = 40041,

    MISSING_ACCESS = 50001,
    INVALID_ACCOUNT_TYPE,
    CANNOT_EXECUTE_ON_DM_CHANNEL,
    GUILD_WIDGET_DISABLED,
    CANNOT_EDIT_MESSAGE_BY_ANOTHER_USER,
    CANNOT_SEND_EMPTY_MESSAGE,
    CANNOT_SEND_MESSAGE_TO_USER,
    CANNOT_SEND_MESSAGE_IN_VOICE_CHANNEL,
    VERIFICATION_LEVEL_TOO_HIGH,
    OAUTH2_APPLICATION_DOES_NOT_HAVE_BOT,
    OAUTH2_APPLICATION_LIMIT_REACHED,
    OAUTH2_INVALID_STATE,
    MISSING_PERMISSIONS,
    INVALID_TOKEN,
    NOTE_WAS_TOO_LONG,
    BULK_DELETE_INVALID_MESSAGE_COUNT,

    MESSAGE_PIN_INVALID_CHANNEL = 50019,
    INVITE_CODE_INVALID_OR_TAKEN,
    CANNOT_EXECUTE_ON_SYSTEM_MESSAGE,

    CANNOT_EXECUTE_ON_CHANNEL_TYPE = 50024,
    OAUTH2_INVALID_ACCESS_TOKEN,
    OAUTH2_MISSING_REQUIRED_SCOPE,

    INVALID_WEBHOOK_TOKEN = 50027,
    INVALID_ROLE,

    INVALID_RECIPIENTS = 50033,
    BULK_DELETE_MESSAGE_TOO_OLD,
    INVALID_FORM_BODY_OR_CONTENT_TYPE,
    INVITE_ACCEPTED_TO_GUILD_WITHOUT_BOT,

    INVALID_API_VERSION = 50041,

    UPLOAD_SIZE_EXCEEDED = 50045,
    UPLOAD_FILE_INVALID,

    CANNOT_SELF_REDEEM = 50054,

    REDEEM_PAYMENT_SOURCE_REQUIRED = 50070,

    CHANNEL_REQUIRED_COMMUNITY = 50074,

    INVALID_STICKER = 50081,

    INVALID_ACTION_ON_ARCHIVED_THREAD = 50083,
    INVALID_THREAD_NOTIFICATION_SETTINGS,
    PARAMETER_EARLIER_THAN_CREATION,

    SERVER_NOT_AVAILABLE_IN_YOUR_LOCATION = 50095,

    SERVER_MONETIZATION_REQUIRED = 50097,

    MFA_REQUIRED = 60003,

    NO_USERS_FOUND = 80004,

    REACTION_BLOCKED = 90001,

    API_RESOURCE_OVERLOADED = 130000,

    STAGE_ALREADY_OPEN = 150006,

    THREAD_ALREADY_CREATED = 160004,
    THREAD_LOCKED,
    MAXIMUM_ACTIVE_THREADS,
    MAXIMUM_ACTIVE_ANNOUNCEMENT_THREADS,

    STICKER_INVALID_LOTTIE_JSON = 170001,
    STICKER_LOTTIE_CONTAINS_RASTERIZED_IMAGES,
    STICKER_MAXIMUM_FRAMERATE_EXCEEDED,
    STICKER_FRAME_COUNT_EXCEEDED,
    STICKER_LOTTIE_DIMENSIONS_EXCEEDED,
    STICKER_FRAMERATE_INVALID,
    STICKER_ANIMATION_LENGTH_EXCEEDED,
}
