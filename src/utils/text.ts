import * as CONSTANTS from '../data/constants.js';
import type {
    Emoji,
    Message,
    PartialEmoji,
    Snowflake,
    TimestampFormat,
    UnixTimestampMillis,
} from '../types/types.js';
import { TIMESTAMP_FORMATS } from '../types/types.js';

function _getRegex(chars: string, exact: boolean, caseSensitive = false, timestamp = false) {
    return new RegExp(
        `${exact ? '^' : ''}<${chars}(\\d{${timestamp ? '1,16' : '17,19'}})${
            timestamp ? `(:[${TIMESTAMP_FORMATS.join('')}])?` : ''
        }>${exact ? '$' : ''}`,
        caseSensitive ? undefined : 'i'
    );
}
function getRegex(chars: string, caseSensitive = false, timestamp = false) {
    return [_getRegex(chars, false, caseSensitive, timestamp), _getRegex(chars, true, caseSensitive, timestamp)];
}

export type NullableID = Snowflake | null;

export const [USER_MENTION_REGEX, USER_MENTION_REGEX_EXACT] = getRegex('@!?');

export const [CHANNEL_MENTION_REGEX, CHANNEL_MENTION_REGEX_EXACT] = getRegex('#');

export const [ROLE_MENTION_REGEX, ROLE_MENTION_REGEX_EXACT] = getRegex('@&');

export const [EMOJI_REGEX, EMOJI_REGEX_EXACT] = getRegex('(a?):([a-z0-9]{2,32}):');

export const [TIMESTAMP_REGEX, TIMESTAMP_REGEX_EXACT] = getRegex('t:', true, true);

export const [COMMAND_LINK_REGEX, COMMAND_LINK_REGEX_EXACT] = getRegex(
    '/[-_\\p{L}\\p{N}\\p{sc=Deva}\\p{sc=Thai}]{1,32}:',
    true
);

export default class TextUtils {
    static #getFirstMatch(text: string, regex: RegExp): string | null {
        const matches = text.match(regex);
        return matches ? matches[1] : null;
    }

    static extractAny(text: string, exact = true): Snowflake | Emoji | number | null {
        return (
            this.mention.extractUserID(text, exact) ||
            this.mention.extractRoleID(text, exact) ||
            this.mention.extractChannelID(text, exact) ||
            this.emoji.extract(text, exact) ||
            this.timestamp.extract(text, exact)
        );
    }

    static mention = {
        extractUserID: (text: string, exact = true): NullableID => {
            const regex = exact ? USER_MENTION_REGEX_EXACT : USER_MENTION_REGEX;
            return this.#getFirstMatch(text, regex) as NullableID;
        },
        parseUser: (id: Snowflake): string => {
            return `<@${id}>`;
        },
        extractRoleID: (text: string, exact = true): NullableID => {
            const regex = exact ? ROLE_MENTION_REGEX_EXACT : ROLE_MENTION_REGEX;
            return this.#getFirstMatch(text, regex) as NullableID;
        },
        parseRole: (id: Snowflake): string => {
            return `<@&${id}>`;
        },
        extractChannelID: (text: string, exact = true): NullableID => {
            const regex = exact ? CHANNEL_MENTION_REGEX_EXACT : CHANNEL_MENTION_REGEX;
            return this.#getFirstMatch(text, regex) as NullableID;
        },
        parseChannel: (id: Snowflake): string => {
            return `<#${id}>`;
        },
        extractCommandID: (text: string, exact = true): NullableID => {
            const regex = exact ? COMMAND_LINK_REGEX_EXACT : COMMAND_LINK_REGEX;
            return this.#getFirstMatch(text, regex) as NullableID;
        },
        parseCommand: (cmdString: string, id: Snowflake): string => {
            return `</${cmdString}:${id}>`;
        },
    };

    static emoji = {
        extract: (text: string, exact = true): Emoji | null => {
            const regex = exact ? EMOJI_REGEX_EXACT : EMOJI_REGEX;
            const matches = text.match(regex);
            return matches
                ? {
                      name: matches[2],
                      id: matches[3] as Snowflake,
                      animated: !!matches[1],
                  }
                : null;
        },
        parse: (emoji: Emoji, addZeroWidth = false): string => {
            return `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}${addZeroWidth ? '\u200B' : ''}>`;
        },
        parseDisplay: (emoji: PartialEmoji, nameOnly = false): string => {
            if (nameOnly) {
                return `:${emoji.name}:`;
            }
            if (!emoji.id) {
                return emoji.name || '';
            }
            if (emoji.name === null) {
                return '';
            }
            /*
             * Typescript can be so fucking braindead sometimes...
             * it already forgot the type narrowing for emoji.name from the block above,
             * therefore we need to copy the emoji object
             */
            const emojiCopy: Emoji = {
                name: emoji.name,
                id: emoji.id,
                animated: emoji.animated,
            };
            return TextUtils.emoji.parse(emojiCopy);
        },
        parseReaction: (emoji: Emoji): string => {
            return `${emoji.name}:${emoji.id}`;
        },
    };

    static timestamp = {
        extract: (text: string, exact = true): UnixTimestampMillis | null => {
            const regex = exact ? TIMESTAMP_REGEX_EXACT : TIMESTAMP_REGEX;
            const match = this.#getFirstMatch(text, regex);
            return match ? parseInt(match) * 1000 : null;
        },
        parse: (timestamp: UnixTimestampMillis, format?: TimestampFormat): string => {
            return `<t:${Math.round(timestamp / 1000)}${format ? `:${format}` : ''}>`;
        },
        // https://discord.com/developers/docs/reference#snowflakes-snowflake-id-format-structure-left-to-right
        fromSnowflake(id: Snowflake): UnixTimestampMillis {
            const idInt = BigInt(id);
            return Number(idInt >> BigInt(22)) + CONSTANTS.DISCORD_EPOCH;
        },
        // https://discord.com/developers/docs/reference#snowflake-ids-in-pagination-generating-a-snowflake-id-from-a-timestamp-example
        toSnowflake(timestamp: UnixTimestampMillis) {
            return (timestamp - CONSTANTS.DISCORD_EPOCH) << 22;
        },
    };

    static inviteLink = {
        extract: (text: string, exact = true): string | null => {
            const regex = exact ? CONSTANTS.INVITE_REGEX_EXACT : CONSTANTS.INVITE_REGEX;
            return this.#getFirstMatch(text, regex);
        },
        extractAll: (text: string): string[] | null => {
            return text.match(CONSTANTS.INVITE_REGEX_GLOBAL);
        },
        parse: (code: string): string => {
            return CONSTANTS.INVITE_LINK_PREFIX + code;
        },
    };

    static parseQueryString(data: Record<string, string | number>): string {
        let qs = '';
        for (const key in data) {
            qs += `${qs ? '&' : '?'}${key}=${encodeURIComponent(data[key])}`;
        }
        return qs;
    }

    static truncate(text: string, length = 2000, suffix = '', strict = false) {
        const len = strict ? text.length : Array.from(text).length;
        const suffixLength = suffix.length + 4;
        return len > length ? `${text.substring(0, length - suffixLength)}${suffix} ...` : text;
    }

    static message = {
        getLink: (message: Message & { guild_id: Snowflake }): string => {
            return `${CONSTANTS.DISCORD_DOMAIN}/channels/${message.guild_id}/${message.channel_id}/${message.id}`;
        },
        getLinkByIDs: (guild_id: Snowflake, channel_id: Snowflake, message_id: Snowflake): string => {
            return `${CONSTANTS.DISCORD_DOMAIN}/channels/${guild_id}/${channel_id}/${message_id}`;
        },
    };
}
