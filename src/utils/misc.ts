import { ID_REGEX_EXACT } from '../data/constants.js';
import EMOTES from '../data/emotes.json' assert { type: 'json' };
import SHITTY_EMOTES from '../data/shittyEmotes.json' assert { type: 'json' };
import type Bot from '../structures/bot.js';
import { ACTIVITY_TYPES } from '../types/numberTypes.js';
import type { Emoji, Interaction, Locale, Snowflake, Status } from '../types/types.js';
import LangUtils from './language.js';
import PermissionUtils from './permissions.js';
import TextUtils, { EMOJI_REGEX_EXACT } from './text.js';

export type EmojiKey = keyof typeof EMOTES | keyof typeof SHITTY_EMOTES;

export default class MiscUtils {
    bot: Bot;

    constructor(bot: Bot) {
        this.bot = bot;
    }

    getEmojiText(emojiKey: EmojiKey, guildID?: Snowflake, channelID?: Snowflake) {
        if (!guildID) {
            return EMOTES[emojiKey];
        }
        const matches = this.bot.perms.matchesMemberCache(
            this.bot.user.id,
            'USE_EXTERNAL_EMOJIS',
            guildID,
            channelID
        );
        return matches ? EMOTES[emojiKey] : SHITTY_EMOTES[emojiKey];
    }

    getEmoji(emojiKey: EmojiKey, interaction: Interaction) {
        if (interaction.app_permissions) {
            return PermissionUtils.has(interaction.app_permissions, 'USE_EXTERNAL_EMOJIS')
                ? EMOTES[emojiKey]
                : SHITTY_EMOTES[emojiKey];
        }
        return this.getEmojiText(emojiKey, interaction.guild_id, interaction.channel_id);
    }

    static getDefaultEmoji(emojiKey: EmojiKey) {
        return SHITTY_EMOTES[emojiKey];
    }

    #getActivityTypeName(type: ACTIVITY_TYPES, locale?: Locale) {
        const stringType = ACTIVITY_TYPES[type] as keyof typeof ACTIVITY_TYPES;
        return LangUtils.get(`PRESENCE_TYPE_${stringType}`, locale);
    }

    getStatus(userID: Snowflake, interaction: Interaction) {
        const presence = this.bot.cache.presences.get(userID);
        if (!presence) {
            return null;
        }
        const uppercaseStatus = presence.status.toUpperCase() as Uppercase<Status>;
        let status = this.getEmoji(uppercaseStatus, interaction);
        const statusType = LangUtils.get(`STATUS_${uppercaseStatus}`, interaction.locale);
        if (!presence.activities.length) {
            return `${status} ${statusType}`;
        }
        const activity = presence.activities[0];
        status += ` ${this.#getActivityTypeName(activity.type)}`;
        if (activity.type === ACTIVITY_TYPES.CUSTOM) {
            if (activity.emoji) {
                const emojiObject = activity.emoji.id ? this.bot.cache.emojis.find(activity.emoji.id) : null;
                const emojiText = emojiObject ? TextUtils.emoji.parse(emojiObject) : activity.emoji.name;
                if (emojiText) {
                    status += ` ${emojiText}${activity.state ? ` **${activity.state}**` : ''}`;
                } else if (presence.activities.length > 1) {
                    const secondActivity = presence.activities[1];
                    status += this.#getActivityTypeName(activity.type);
                    if (
                        secondActivity.type === ACTIVITY_TYPES.STREAMING &&
                        secondActivity.name &&
                        !/^\s+$/.test(secondActivity.name) &&
                        secondActivity.url &&
                        !/^\s$/.test(secondActivity.url)
                    ) {
                        status += ` **[${secondActivity.name}](${secondActivity.url})**`;
                    } else {
                        status += ` **${secondActivity.name}**`;
                    }
                } else {
                    status += ` ${statusType}`;
                }
            } else if (!activity.state || !activity.details || !activity.application_id) {
                status += ` ${statusType}`;
            } else {
                status += ` **${activity.state}**`;
            }
        } else if (
            activity.type === ACTIVITY_TYPES.STREAMING &&
            activity.name.trim() &&
            activity.url &&
            !/^\s$/.test(activity.url)
        ) {
            status += ` **[${activity.name}](${activity.url})**`;
        } else {
            status += ` **${activity.name}**`;
        }

        for (const activity of presence.activities) {
            if (
                activity.type !== ACTIVITY_TYPES.CUSTOM &&
                (activity.application_id || activity.details || activity.state)
            ) {
                status += ` ${this.getEmoji('RPC', interaction)}`;
                break;
            }
        }
        return status;
    }

    async resolveEmoji(emojiString: string, guildID: Snowflake) {
        let cachedEmoji: Emoji | null = null;
        const emojiRegexMatches = emojiString.match(EMOJI_REGEX_EXACT);
        if (emojiRegexMatches) {
            cachedEmoji = this.bot.cache.emojis.get(guildID, emojiRegexMatches[2] as Snowflake);
        } else if (ID_REGEX_EXACT.test(emojiString)) {
            cachedEmoji = this.bot.cache.emojis.get(guildID, emojiString as Snowflake);
        }

        let fetchedEmoji: Emoji | null = null;
        if (!cachedEmoji) {
            const partialEmoji = TextUtils.emoji.extract(emojiString);
            fetchedEmoji = partialEmoji ? await this.bot.api.emoji.fetch(guildID, partialEmoji.id) : null;
        }
        return fetchedEmoji || cachedEmoji;
    }

    static randomNumber(max: number, min = 0) {
        return Math.random() * (max + 1 - min) + min;
    }

    static randomInt(max: number, min = 0) {
        return Math.floor(this.randomNumber(max, min));
    }

    static randomItem<T>(items: T[]) {
        return items[this.randomInt(items.length - 1)];
    }
}
