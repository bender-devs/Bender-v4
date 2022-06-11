import { Emoji, Snowflake, UnixTimestamp } from '../data/types';

function getRegex(chars: string, exact: boolean, timestamp = false) {
    return new RegExp(`${exact ? '^' : ''}<${chars}(\\d{${timestamp ? '1-16' : '17-19'}})${timestamp ? '(:[tTdDfFR])?' : ''}${exact ? '$' : ''}>`);
}

export type TimestampFormat = 't' | 'T' | 'd' | 'D' | 'f' | 'F' | 'R';

export const USER_MENTION_REGEX = getRegex('@!?', false);
export const USER_MENTION_EXACT_REGEX = getRegex('@!?', true);

export const CHANNEL_MENTION_REGEX = getRegex('#', false);
export const CHANNEL_MENTION_EXACT_REGEX = getRegex('#', true);

export const ROLE_MENTION_REGEX = getRegex('@&', false);
export const ROLE_MENTION_EXACT_REGEX = getRegex('@&', true);

export const EMOJI_REGEX = getRegex('(a?):([a-z0-9]{2,32}):', false);
export const EMOJI_EXACT_REGEX = getRegex('(a?):([a-z0-9]{2,32}):', true);

export const TIMESTAMP_REGEX = getRegex('t:', false, true);
export const TIMESTAMP_EXACT_REGEX = getRegex('t:', true, true);

export default class TextFormatUtils {
    static #getFirstMatchAsID(text: string, regex: RegExp): Snowflake | null {
        const matches = text.match(regex);
        return matches ? matches[1] as Snowflake : null;
    }

    static extractAny(text: string, exact = true): Snowflake | Emoji | number | null {
        return this.mentions.extractUserID(text, exact)
            || this.mentions.extractChannelID(text, exact)
            || this.emojis.extract(text, exact)
            || this.timestamps.extract(text, exact);
    }

    static mentions = {
        extractUserID: (text: string, exact = true): Snowflake | null => {
            const regex = exact ? USER_MENTION_EXACT_REGEX : USER_MENTION_REGEX;
            return this.#getFirstMatchAsID(text, regex);
        },
        parseUser: (id: Snowflake, nick = false): string => {
            return `<@${nick ? '!' : ''}${id}>`
        },
        extractChannelID: (text: string, exact = true): Snowflake | null => {
            const regex = exact ? CHANNEL_MENTION_EXACT_REGEX : CHANNEL_MENTION_REGEX;
            return this.#getFirstMatchAsID(text, regex);
        },
        parseChannel: (id: Snowflake): string => {
            return `<#${id}>`
        }
    }

    static emojis = {
        extract: (text: string, exact = true): Emoji | null => {
            const regex = exact ? EMOJI_EXACT_REGEX : EMOJI_REGEX;
            const matches = text.match(regex);
            if (!matches) {
                return null;
            }
            return {
                name: matches[2],
                id: matches[3] as Snowflake,
                animated: !!matches[1]
            }
        },
        parse: (emoji: Emoji): string => {
            return `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`;
        }
    }

    static timestamps = {
        extract: (text: string, exact = true): UnixTimestamp | null => {
            const regex = exact ? TIMESTAMP_EXACT_REGEX : TIMESTAMP_REGEX;
            const matches = text.match(regex);
            return matches ? parseInt(matches[1]) : null;
        },
        parse: (timestamp: UnixTimestamp, format?: TimestampFormat): string => {
            return `<t:${timestamp}${format ? `:${format}` : ''}>`;
        }
    }
}