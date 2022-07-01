import Bot from '../structures/bot';
import * as EMOTES from '../data/emotes.json';
import * as SHITTY_EMOTES from '../data/shitty_emotes.json';
import { Interaction, Locale, Snowflake, Status } from '../types/types';
import LangUtils from './language';
import { ACTIVITY_TYPES } from '../types/numberTypes';
import TextUtils from './text';
import PermissionUtils from './permissions';

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
        const matches = this.bot.perms.matchesMemberCache(this.bot.user.id, 'USE_EXTERNAL_EMOJIS', guildID, channelID);
        return matches ? EMOTES[emojiKey] : SHITTY_EMOTES[emojiKey];
    }

    getEmoji(emojiKey: EmojiKey, interaction: Interaction) {
        if (interaction.app_permissions) {
            return PermissionUtils.has(interaction.app_permissions, 'USE_EXTERNAL_EMOJIS') ? EMOTES[emojiKey] : SHITTY_EMOTES[emojiKey];
        }
        return this.getEmojiText(emojiKey, interaction.guild_id, interaction.channel_id);
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
                        secondActivity.name && !/^\s+$/.test(secondActivity.name) &&
                        secondActivity.url && !/^\s$/.test(secondActivity.url)
                    ) {
                        status += ` **[${secondActivity.name}](${secondActivity.url})**`;
                    } else {
                        status += ` **${secondActivity.name}**`
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
            activity.url && !/^\s$/.test(activity.url)
        ) {
            status += ` **[${activity.name}](${activity.url})**`;
        } else {
            status += ` **${activity.name}**`;
        }

        for (const activity of presence.activities) {
            if (activity.type !== ACTIVITY_TYPES.CUSTOM && (activity.application_id || activity.details || activity.state)) {
                status += ` ${this.getEmoji('RPC', interaction)}`;
                break;
            }
        }
        return status;
    }
}