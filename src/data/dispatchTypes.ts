export const events = [
    "GUILD_GET",
    "GUILD_EDIT",
    "GUILD_GET_PRUNE_COUNT",
    "GUILD_PRUNE",
    "GUILD_FETCH_REGIONS",

    "BAN_GET",
    "BAN_LIST",
    "BAN_ADD",
    "BAN_REMOVE",

    "ROLE_LIST",
    "ROLE_ADD",
    "ROLE_EDIT",
    "ROLE_REMOVE",
    "ROLE_SET_POSITIONS",

    "MEMBER_GET",
    "MEMBER_LIST",
    "MEMBER_ADD_ROLE",
    "MEMBER_REMOVE_ROLE",
    "MEMBER_SET_ROLES",
    "MEMBER_EDIT",
    "MEMBER_SET_SELF_NICK",
    "MEMBER_KICK",

    "EMOJI_LIST",
    "EMOJI_GET",
    "EMOJI_ADD",
    "EMOJI_EDIT",

    "USER_GET"
] as const;

export type eventName = typeof events[number];