import { EXAMPLE_DURATION, EXAMPLE_TIMESTAMP } from '../data/constants.js';
import type { CachedGuild } from '../structures/cacheHandler.js';
import type { Guild, Locale, ReplaceMap, User } from '../types/types.js';
import DiscordUtils from './discord.js';
import LangUtils from './language.js';
import TextUtils from './text.js';
import TimeUtils from './time.js';

export default class Replacers {
    static replace(text: string, replaceMap: ReplaceMap, locale?: Locale) {
        for (const key in replaceMap) {
            const replaceRegex = new RegExp(`{{${key}}}`, 'g');
            const replacement = replaceMap[key];
            const replaceText =
                typeof replacement === 'number' ? LangUtils.formatNumber(replacement, locale) : replacement;
            text = text.replace(replaceRegex, replaceText);
        }
        return text;
    }

    static minage(duration?: number, message?: string, locale?: Locale) {
        const durationText = TimeUtils.formatDuration(EXAMPLE_DURATION, locale);
        const timestamp = duration ? Date.now() + duration : EXAMPLE_TIMESTAMP;

        const replacements: ReplaceMap = {
            duration: durationText,
            timestamp: TimeUtils.formatDate(timestamp),
            timestampRelative: TimeUtils.relative(timestamp),
        };
        if (message) {
            return this.replace(message, replacements, locale);
        }
        return LangUtils.getAndReplace('MINAGE_DEFAULT_MESSAGE', replacements, locale);
    }

    static welcomeMessage(
        message: string,
        user: User,
        guild: CachedGuild | Guild,
        join: boolean,
        locale?: Locale
    ) {
        const mc = guild.approximate_member_count || '??';
        const replaceObj: ReplaceMap = {
            user: DiscordUtils.user.tag(user),
            member: TextUtils.user.format(user.id),
            id: user.id,
            server: guild.name,
            count: mc,
            count_ord: mc === '??' ? mc : LangUtils.formatOrdinalNumber(mc, locale),
        };
        if (join) {
            const userCreated = TextUtils.timestamp.fromSnowflake(user.id);
            const newUser = userCreated >= Date.now() - 1000 * 60 * 60 * 24;
            replaceObj.new = newUser
                ? `\n${LangUtils.formatDateAgo('NEW_ACCOUNT_NOTICE', userCreated, locale)}`
                : '';
        }
        return this.replace(message, replaceObj, locale);
    }

    static moderationDM(
        message: string,
        user: User,
        moderator: User,
        guildName: string,
        reason?: string,
        locale?: Locale
    ) {
        return this.replace(
            message,
            {
                user: DiscordUtils.user.tag(user),
                moderator: DiscordUtils.user.tag(moderator),
                reason: reason || LangUtils.get('NONE', locale),
                server: guildName,
            },
            locale
        );
    }
}
