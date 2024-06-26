import type Bot from '../structures/bot.js';
import type { CachedGuild } from '../structures/cacheHandler.js';
import type { GuildDotFormatKey, GuildSettings } from '../types/dbTypes.js';
import type { GuildMemberAddData } from '../types/gatewayTypes.js';
import type { Guild } from '../types/types.js';
import Replacers from '../utils/replacers.js';
import { EventUtilsItem } from './eventUtils.js';

export default class MemberLogUtils extends EventUtilsItem {
    constructor(bot: Bot) {
        super(bot);
    }

    static SETTINGS = {
        JOIN: ['memberLog.channel', 'memberLog.join', 'memberLog.joinDM'] satisfies GuildDotFormatKey[],
    };

    join = async (eventData: GuildMemberAddData, guild: Guild | CachedGuild, settings: GuildSettings) => {
        if (settings.memberLog?.channel && settings.memberLog?.join) {
            const replacedMessage = Replacers.welcomeMessage(
                settings.memberLog.join,
                eventData.user,
                guild,
                true,
                guild.preferred_locale
            );
            this.bot.api.channel.send(settings.memberLog.channel, {
                content: replacedMessage,
                allowed_mentions: {
                    users: [eventData.user.id],
                },
            });
        }
        if (settings.memberLog?.joinDM) {
            const replacedMessage = Replacers.welcomeMessage(
                settings.memberLog.joinDM,
                eventData.user,
                guild,
                false,
                guild.preferred_locale
            );
            this.bot.api.user.send(eventData.user.id, { content: replacedMessage });
        }
    };
}
