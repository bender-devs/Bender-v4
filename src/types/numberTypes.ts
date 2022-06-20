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
    BOT_HTTP_INTERACTIONS = 1 << 19
}

// https://discord.com/developers/docs/resources/user#user-object-premium-types
export const enum PREMIUM_TYPES {
    NONE,
    NITRO_CLASSIC,
    NITRO
}

// https://discord.com/developers/docs/topics/gateway#activity-object-activity-types
export enum ACTIVITY_TYPES {
    PLAYING,
    STREAMING,
    LISTENING,
    WATCHING,
    CUSTOM,
    COMPETING
}

// https://discord.com/developers/docs/resources/guild#guild-object-default-message-notification-level
export const enum MESSAGE_NOTIFICATION_LEVELS {
    ALL_MESSAGES,
    ONLY_MENTIONS
}

// https://discord.com/developers/docs/resources/guild#guild-object-explicit-content-filter-level
export const enum EXPLICIT_FILTER_LEVELS {
    DISABLED,
    MEMBERS_WITHOUT_ROLES,
    ALL_MEMBERS
}

// https://discord.com/developers/docs/resources/guild#guild-object-mfa-level
export const enum MFA_LEVELS {
    NONE,
    ELEVATED
}

// https://discord.com/developers/docs/resources/guild#guild-object-verification-level
export const enum VERIFICATION_LEVELS {
    NONE,
    LOW,
    MEDIUM,
    HIGH,
    VERY_HIGH
}

// https://discord.com/developers/docs/resources/guild#guild-object-guild-nsfw-level
export const enum NSFW_LEVELS {
    DEFAULT,
    EXPLICIT,
    SAFE,
    AGE_RESTRICTED
}

// https://discord.com/developers/docs/resources/guild#guild-object-premium-tier
export const enum PREMIUM_TIERS {
    NONE,
    LOW,
    MEDIUM,
    HIGH,
    VERY_HIGH
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
    CONTEXT_MENU_COMMAND
}

// https://discord.com/developers/docs/resources/channel#message-object-message-activity-types
export const enum MESSAGE_ACTIVITY_TYPES {
    JOIN = 1,
    SPECTATE,
    LISTEN,
    JOIN_REQUEST = 5
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
    FAILED_TO_MENTION_SOME_ROLES_IN_THREAD = 1 << 8
}

// https://discord.com/developers/docs/resources/guild#guild-object-system-channel-flags
export const enum SYSTEM_CHANNEL_FLAGS {
    SUPPRESS_JOIN_NOTIFICATIONS = 1 << 0,
    SUPPRESS_PREMIUM_SUBSCRIPTIONS = 1 << 1,
    SUPPRESS_GUILD_REMINDER_NOTIFICATIONS = 1 << 2
}

// https://discord.com/developers/docs/resources/stage-instance#stage-instance-object-privacy-level
export const enum STAGE_PRIVACY_LEVELS {
    PUBLIC = 1,
    GUILD_ONLY
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
    GUILD_FORUM
}

// https://discord.com/developers/docs/resources/channel#channel-object-video-quality-modes
export const enum VIDEO_QUALITY_MODES {
    AUTO = 1,
    FULL
}

// https://discord.com/developers/docs/resources/channel#edit-channel-permissions-json-params
export const enum PERMISSION_OVERWRITE_TYPES {
    ROLE,
    MEMBER
}

// https://discord.com/developers/docs/resources/sticker#sticker-object-sticker-types
export const enum STICKER_TYPES {
    STANDARD = 1,
    GUILD
}

// https://discord.com/developers/docs/resources/sticker#sticker-object-sticker-format-types
export const enum STICKER_FORMAT_TYPES {
    PNG = 1,
    APNG,
    LOTTIE
}

// https://discord.com/developers/docs/resources/guild#integration-object-integration-expire-behaviors
export const enum INTEGRATION_EXPIRE_BEHAVIORS {
    REMOVE_ROLE,
    KICK
}

// https://discord.com/developers/docs/interactions/slash-commands#interaction-object-interaction-request-type
export const enum INTERACTION_REQUEST_TYPES {
    PING = 1,
    APPLICATION_COMMAND,
    MESSAGE_COMPONENT,
    APPLICATION_COMMAND_AUTOCOMPLETE,
    MODAL_SUBMIT
}

// https://discord.com/developers/docs/interactions/slash-commands#interaction-response-object-interaction-callback-type
export const enum INTERACTION_CALLBACK_TYPES {
    PONG = 1,
    CHANNEL_MESSAGE_WITH_SOURCE = 4,
    DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
    DEFERRED_UPDATE_MESSAGE,
    UPDATE_MESSAGE,
    APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
    MODAL
}

// https://discord.com/developers/docs/interactions/slash-commands#interaction-response-object-interaction-application-command-callback-data-flags
export const enum INTERACTION_CALLBACK_FLAGS {
    SUPPRESS_EMBEDS = 1 << 2,
    EPHEMERAL = 1 << 6
}

// https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-types
export const enum COMMAND_TYPES {
    CHAT_INPUT = 1,
    USER,
    MESSAGE
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
    ATTACHMENT
}

// https://discord.com/developers/docs/interactions/slash-commands#applicationcommandpermissiontype
export const enum COMMAND_PERMISSION_TYPES {
    ROLE = 1,
    USER,
    CHANNEL
}

// https://discord.com/developers/docs/interactions/message-components#component-object-component-types
export const enum MESSAGE_COMPONENT_TYPES {
    ACTION_ROW = 1,
    BUTTON,
    SELECT_MENU
}

// https://discord.com/developers/docs/interactions/message-components#button-object-button-styles
export const enum BUTTON_STYLES {
    PRIMARY = 1,
    SECONDARY,
    SUCCESS,
    DANGER,
    LINK
}

// https://discord.com/developers/docs/resources/application#application-object-application-flags
export const enum APPLICATION_FLAGS {
    GATEWAY_PRESENCE = 1 << 12,
    GATEWAY_PRESENCE_LIMITED = 1 << 13,
    GATEWAY_GUILD_MEMBERS = 1 << 14,
    GATEWAY_GUILD_MEMBERS_LIMITED = 1 << 15,
    VERIFICATION_PENDING_GUILD_LIMIT = 1 << 16,
    EMBEDDED = 1 << 17,
    GATEWAY_MESSAGE_CONTENT = 1 << 18,
    GATEWAY_MESSAGE_CONTENT_LIMITED = 1 << 19
}

// https://discord.com/developers/docs/topics/teams#data-models-membership-state-enum
export const enum TEAM_MEMBERSHIP_STATE {
    INVITED = 1,
    ACCEPTED
}

// https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-privacy-level
export const enum GUILD_SCHEDULED_EVENT_PRIVACY_LEVEL {
    GUILD_ONLY = 2
}

// https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-entity-types
export const enum GUILD_SCHEDULED_EVENT_ENTITY_TYPES {
    STAGE_INSTANCE = 1,
    VOICE,
    EXTERNAL
}

// https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-status
export const enum GUILD_SCHEDULED_EVENT_STATUS {
    SCHEDULED = 1,
    ACTIVE,
    COMPLETED,
    CANCELED
}

// https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-trigger-types
export const enum AUTOMOD_TRIGGER_TYPES {
    KEYWORD = 1,
    HARMFUL_LINK,
    SPAM,
    KEYWORD_PRESET
}

// https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-keyword-preset-types
export const enum AUTOMOD_KEYWORD_PRESET_TYPES {
    PROFANITY = 1,
    SEXUAL_CONTENT,
    SLURS
}

// https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-event-types
export const enum AUTOMOD_EVENT_TYPES {
    MESSAGE_SEND = 1
}

// https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-action-object-action-types
export const enum AUTOMOD_ACTION_TYPES {
    BLOCK_MESSAGE = 1,
    SEND_ALERT_MESSAGE,
    TIMEOUT
}

// https://discord.com/developers/docs/topics/opcodes-and-status-codes#gateway-gateway-opcodes
// (S = Send, R = Receive)
export const enum GATEWAY_OPCODES {
    DISPATCH,               // (R)
    HEARTBEAT,              // (S/R)
    IDENTIFY,               // (S)
    PRESENCE_UPDATE,        // (S)
    VOICE_STATE_UPDATE,     // (S)
    RESUME = 6,             // (S)
    RECONNECT,              // (R)
    REQUEST_GUILD_MEMBERS,  // (S)
    INVALID_SESSION,        // (R)
    HELLO,                  // (R)
    HEARTBEAT_ACK           // (R)
}

// https://discord.com/developers/docs/topics/gateway#gateway-intents
export const enum INTENT_FLAGS {
    GUILDS = 1 << 0,
    GUILD_MEMBERS = 1 << 1,
    GUILD_BANS = 1 << 2,
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
    GUILD_SCHEDULED_EVENTS = 1 << 16
}

// https://discord.com/developers/docs/topics/gateway#gateways-gateway-versions
export const enum GATEWAY_VERSIONS {
    CURRENT = 9
}

// used internally to determine gateway connection state
export const enum CLIENT_STATE {
    ALIVE,
    DEAD,
    CONNECTING,
    RECONNECTING,
    WAITING
}

// https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags
// not a const enum since we want to be able to access it without hardcoding the keys
export enum PERMISSIONS {
    CREATE_INSTANT_INVITE = 1 << 0,
    KICK_MEMBERS = 1 << 1,
    BAN_MEMBERS = 1 << 2,
    ADMINISTRATOR = 1 << 3,
    MANAGE_CHANNELS = 1 << 4,
    MANAGE_GUILD = 1 << 5,
    ADD_REACTIONS = 1 << 6,
    VIEW_AUDIT_LOG = 1 << 7,
    PRIORITY_SPEAKER = 1 << 8,
    STREAM = 1 << 9,
    VIEW_CHANNEL = 1 << 10,
    SEND_MESSAGES = 1 << 11,
    SEND_TTS_MESSAGES = 1 << 12,
    MANAGE_MESSAGES = 1 << 13,
    EMBED_LINKS = 1 << 14,
    ATTACH_FILES = 1 << 15,
    READ_MESSAGE_HISTORY = 1 << 16,
    MENTION_EVERYONE = 1 << 17,
    USE_EXTERNAL_EMOJIS = 1 << 18,
    VIEW_GUILD_INSIGHTS = 1 << 19,
    CONNECT = 1 << 20,
    SPEAK = 1 << 21,
    MUTE_MEMBERS = 1 << 22,
    DEAFEN_MEMBERS = 1 << 23,
    MOVE_MEMBERS = 1 << 24,
    USE_VAD = 1 << 25,
    CHANGE_NICKNAME = 1 << 26,
    MANAGE_NICKNAMES = 1 << 27,
    MANAGE_ROLES = 1 << 28,
    MANAGE_WEBHOOKS = 1 << 29,
    MANAGE_EMOJIS_AND_STICKERS = 1 << 30,
    USE_APPLICATION_COMMANDS = 1 << 31,
    REQUEST_TO_SPEAK = 1 << 32,
    MANAGE_EVENTS = 1 << 33,
    MANAGE_THREADS = 1 << 34,
    CREATE_PUBLIC_THREADS = 1 << 35,
    CREATE_PRIVATE_THREADS = 1 << 36,
    USE_EXTERNAL_STICKERS = 1 << 37,
    SEND_MESSAGES_IN_THREADS = 1 << 38,
    USE_EMBEDDED_ACTIVITIES = 1 << 39,
    MODERATE_MEMBERS = 1 << 40
}

export const ALL_PERMISSIONS = 1 << 0 | 1 << 1 | 1 << 2 | 1 << 3 | 1 << 4 | 1 << 5 | 1 << 6 | 1 << 7 | 1 << 8 | 1 << 9 | 1 << 10 | 1 << 11 | 1 << 12 | 1 << 13 | 1 << 14 | 1 << 15 | 1 << 16 | 1 << 17 | 1 << 18 | 1 << 19 | 1 << 20 | 1 << 21 | 1 << 22 | 1 << 23 | 1 << 24 | 1 << 25 | 1 << 26 | 1 << 27 | 1 << 28 | 1 << 29 | 1 << 30 | 1 << 31 | 1 << 32 | 1 << 33 | 1 << 34 | 1 << 35 | 1 << 36 | 1 << 37;

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
    DISALLOWED_INTENTS
}

// additional disconnect codes for client-side disconnects
export const enum CUSTOM_GATEWAY_ERRORS {
    RECONNECT_REQUESTED = 4997,
    INVALID_SESSION,
    HEARTBEAT_TIMEOUT
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