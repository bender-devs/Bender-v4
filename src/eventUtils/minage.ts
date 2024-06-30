import type Bot from '../structures/bot.js';
import type { CachedGuild } from '../structures/cacheHandler.js';
import type { GuildDotFormatKey, GuildSettings } from '../types/dbTypes.js';
import type { GuildMemberAddData } from '../types/gatewayTypes.js';
import type { Guild } from '../types/types.js';
import LangUtils from '../utils/language.js';
import Replacers from '../utils/replacers.js';
import TextUtils from '../utils/text.js';
import TimeUtils from '../utils/time.js';
import { EventUtilsItem } from './eventUtils.js';

export default class MinAgeUtils extends EventUtilsItem {
    constructor(bot: Bot) {
        super(bot);
    }

    static SETTINGS = {
        JOIN: ['minage'] satisfies GuildDotFormatKey[],
    };

    join = async (
        eventData: GuildMemberAddData,
        guild: Guild | CachedGuild,
        settings: GuildSettings
    ): Promise<boolean> => {
        if (!settings.minage || !settings.minage.enabled || !settings.minage.duration) {
            return false; // Minage is not enabled
        }
        /** The minimum timestamp of account creation */
        const minAgeTimestamp = Date.now() - settings.minage.duration;
        /** The timestamp of account creation */
        const accountTimestamp = TextUtils.timestamp.fromSnowflake(eventData.user.id);

        if (accountTimestamp <= minAgeTimestamp) {
            return false; // Account is old enough
        }

        const reason = LangUtils.getAndReplace(
            'MINAGE_REASON',
            {
                accountAge: TimeUtils.relative(accountTimestamp),
                duration: TimeUtils.relative(settings.minage.duration),
            },
            guild.preferred_locale
        );

        let actionPromise: Promise<null>;
        if (settings.minage.action === 'ban') {
            // TODO: replace with function that kicks member and handles memberLog.banDM
            actionPromise = this.bot.api.guild.ban(eventData.guild_id, eventData.user.id, undefined, reason);
        } else {
            // TODO: replace with function that kicks member and handles memberLog.kickDM
            actionPromise = this.bot.api.member.kick(eventData.guild_id, eventData.user.id, reason);
        }

        const replacedMessage = Replacers.minage(
            settings.minage.duration,
            settings.minage.message,
            guild.preferred_locale
        );

        return actionPromise
            .then(() => {
                return this.bot.api.user
                    .send(eventData.user.id, {
                        content: replacedMessage,
                        allowed_mentions: {
                            users: [eventData.user.id],
                        },
                    })
                    .then(() => true)
                    .catch((err) => {
                        this.bot.logger.handleError('MINAGE', 'Failed to DM minage message', err);
                        return true;
                    });
            })
            .catch((err) => {
                this.bot.logger.handleError(
                    'MINAGE',
                    `Failed to perform action: ${settings?.minage?.action || 'kick'}`,
                    err
                );
                return true;
            });
    };
}
