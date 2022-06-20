import * as CONSTANTS from '../data/constants';
import { Emoji, Snowflake, UnixTimestampMillis } from '../types/types';

function getRegex(chars: string, exact: boolean, timestamp = false) {
    return new RegExp(`${exact ? '^' : ''}<${chars}(\\d{${timestamp ? '1,16' : '17,19'}})${timestamp ? '(:[tTdDfFR])?' : ''}>${exact ? '$' : ''}`);
}

export type NullableID = Snowflake | null;

export type TimestampFormat = 't' | 'T' | 'd' | 'D' | 'f' | 'F' | 'R';

export const USER_MENTION_REGEX = getRegex('@!?', false);
export const USER_MENTION_REGEX_EXACT = getRegex('@!?', true);

export const CHANNEL_MENTION_REGEX = getRegex('#', false);
export const CHANNEL_MENTION_REGEX_EXACT = getRegex('#', true);

export const ROLE_MENTION_REGEX = getRegex('@&', false);
export const ROLE_MENTION_REGEX_EXACT = getRegex('@&', true);

export const EMOJI_REGEX = getRegex('(a?):([a-z0-9]{2,32}):', false);
export const EMOJI_REGEX_EXACT = getRegex('(a?):([a-z0-9]{2,32}):', true);

export const TIMESTAMP_REGEX = getRegex('t:', false, true);
export const TIMESTAMP_REGEX_EXACT = getRegex('t:', true, true);

export default class TextUtils {
    static #getFirstMatch(text: string, regex: RegExp): string | null {
        const matches = text.match(regex);
        return matches ? matches[1] : null;
    }

    static extractAny(text: string, exact = true): Snowflake | Emoji | number | null {
        return this.mention.extractUserID(text, exact)
            || this.mention.extractChannelID(text, exact)
            || this.emoji.extract(text, exact)
            || this.timestamp.extract(text, exact);
    }

    static mention = {
        extractUserID: (text: string, exact = true): NullableID => {
            const regex = exact ? USER_MENTION_REGEX_EXACT : USER_MENTION_REGEX;
            return this.#getFirstMatch(text, regex) as NullableID;
        },
        parseUser: (id: Snowflake, nick = false): string => {
            return `<@${nick ? '!' : ''}${id}>`
        },
        extractChannelID: (text: string, exact = true): NullableID => {
            const regex = exact ? CHANNEL_MENTION_REGEX_EXACT : CHANNEL_MENTION_REGEX;
            return this.#getFirstMatch(text, regex) as NullableID;
        },
        parseChannel: (id: Snowflake): string => {
            return `<#${id}>`
        }
    }

    static emoji = {
        extract: (text: string, exact = true): Emoji | null => {
            const regex = exact ? EMOJI_REGEX_EXACT : EMOJI_REGEX;
            const matches = text.match(regex);
            return matches ? {
                name: matches[2],
                id: matches[3] as Snowflake,
                animated: !!matches[1]
            } : null;
        },
        parse: (emoji: Emoji, addZeroWidth = false): string => {
            return `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}${addZeroWidth ? '\u200B' : ''}>`;
        }
    }

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
        }
    }

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
        }
    }

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
}