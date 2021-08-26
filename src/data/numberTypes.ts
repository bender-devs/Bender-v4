// https://canary.discord.com/developers/docs/resources/user#user-object-premium-types
export const enum PREMIUM_TYPES {
    NONE,
    NITRO_CLASSIC,
    NITRO
};

// https://canary.discord.com/developers/docs/topics/gateway#activity-object-activity-types
export const enum ACTIVITY_TYPES {
    PLAYING,
    STREAMING,
    LISTENING,
    WATCHING,
    CUSTOM,
    COMPETING
};

// https://canary.discord.com/developers/docs/resources/guild#guild-object-default-message-notification-level
export const enum MESSAGE_NOTIFICATION_LEVELS {
    ALL_MESSAGES,
    ONLY_MENTIONS
};

// https://canary.discord.com/developers/docs/resources/guild#guild-object-explicit-content-filter-level
export const enum EXPLICIT_FILTER_LEVELS {
    DISABLED,
    MEMBERS_WITHOUT_ROLES,
    ALL_MEMBERS
};

// https://canary.discord.com/developers/docs/resources/guild#guild-object-mfa-level
export const enum MFA_LEVELS {
    NONE,
    ELEVATED
};

// https://canary.discord.com/developers/docs/resources/guild#guild-object-verification-level
export const enum VERIFICATION_LEVELS {
    NONE,
    LOW,
    MEDIUM,
    HIGH,
    VERY_HIGH
};

// https://canary.discord.com/developers/docs/resources/guild#guild-object-guild-nsfw-level
export const enum NSFW_LEVELS {
    DEFAULT,
    EXPLICIT,
    SAFE,
    AGE_RESTRICTED
};

// https://canary.discord.com/developers/docs/resources/guild#guild-object-premium-tier
export const enum PREMIUM_TIERS {
    NONE,
    LOW,
    MEDIUM,
    HIGH,
    VERY_HIGH
};

// https://canary.discord.com/developers/docs/resources/guild#guild-object-system-channel-flags
export const enum SYSTEM_CHANNEL_FLAGS {
    SUPPRESS_JOIN_NOTIFICATIONS = 1 << 0,
    SUPPRESS_PREMIUM_SUBSCRIPTIONS = 1 << 1,
    SUPPRESS_GUILD_REMINDER_NOTIFICATIONS = 1 << 2
};

// https://canary.discord.com/developers/docs/resources/stage-instance#stage-instance-object-privacy-level
export const enum STAGE_PRIVACY_LEVELS {
    PUBLIC = 1,
    GUILD_ONLY
};

// https://canary.discord.com/developers/docs/resources/channel#channel-object-channel-types
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
    GUILD_STAGE_VOICE
};

// https://canary.discord.com/developers/docs/resources/channel#channel-object-video-quality-modes
export const enum VIDEO_QUALITY_MODES {
    AUTO = 1,
    FULL
};

// https://canary.discord.com/developers/docs/resources/channel#edit-channel-permissions-json-params
export const enum PERMISSION_OVERWRITE_TYPES {
    ROLE,
    MEMBER
};

// https://canary.discord.com/developers/docs/resources/sticker#sticker-object-sticker-types
export const enum STICKER_TYPES {
    STANDARD = 1,
    GUILD
}

// https://canary.discord.com/developers/docs/resources/sticker#sticker-object-sticker-format-types
export const enum STICKER_FORMAT_TYPES {
    PNG = 1,
    APNG,
    LOTTIE
}

// https://canary.discord.com/developers/docs/resources/guild#integration-object-integration-expire-behaviors
export const enum INTEGRATION_EXPIRE_BEHAVIORS {
    REMOVE_ROLE,
    KICK
}

// https://canary.discord.com/developers/docs/interactions/slash-commands#interaction-object-interaction-request-type
export const enum INTERACTION_REQUEST_TYPES {
    PING = 1,
    APPLICATION_COMMAND,
    MESSAGE_COMPONENT
};

// https://canary.discord.com/developers/docs/interactions/slash-commands#interaction-response-object-interaction-callback-type
export const enum INTERACTION_CALLBACK_TYPES {
    PONG = 1,
    CHANNEL_MESSAGE_WITH_SOURCE = 4,
    DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
    DEFERRED_UPDATE_MESSAGE,
    UPDATE_MESSAGE
};

// https://canary.discord.com/developers/docs/interactions/slash-commands#interaction-response-object-interaction-application-command-callback-data-flags
export const enum INTERACTION_CALLBACK_FLAGS {
    EPHEMERAL = 1 << 6
};

// https://canary.discord.com/developers/docs/interactions/slash-commands#application-command-object-application-command-option-type
export const enum COMMAND_OPTION_TYPES {
    SUB_COMMAND = 1,
    SUB_COMMAND_GROUP,
    STRING,
    INTEGER,
    BOOLEAN,
    USER,
    CHANNEL,
    ROLE,
    MENTIONABLE
}

// https://canary.discord.com/developers/docs/interactions/slash-commands#applicationcommandpermissiontype
export const enum COMMAND_PERMISSION_TYPES {
    ROLE = 1,
    USER
}

// https://canary.discord.com/developers/docs/interactions/message-components#component-object-component-types
export const enum MESSAGE_COMPONENT_TYPES {
    ACTION_ROW = 1,
    BUTTON,
    SELECT_MENU
}

// https://canary.discord.com/developers/docs/interactions/message-components#button-object-button-styles
export const enum BUTTON_STYLES {
    PRIMARY = 1,
    SECONDARY,
    SUCCESS,
    DANGER,
    LINK
}

// https://canary.discord.com/developers/docs/topics/opcodes-and-status-codes#gateway-gateway-opcodes
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

// https://canary.discord.com/developers/docs/topics/gateway#gateway-intents
export const enum INTENT_FLAGS {
    GUILDS = 1 << 0,
    GUILD_MEMBERS = 1 << 1,
    GUILD_BANS = 1 << 2,
    GUILD_EMOJIS = 1 << 3,
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
    DIRECT_MESSAGE_TYPING = 1 << 14
}

// https://canary.discord.com/developers/docs/topics/gateway#gateways-gateway-versions
export const enum GATEWAY_VERSIONS {
    CURRENT = 9
}

export const enum CLIENT_STATE {
    ALIVE,
    DEAD,
    CONNECTING,
    RECONNECTING,
    WAITING
}