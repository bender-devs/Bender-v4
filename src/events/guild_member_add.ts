import type Bot from '../structures/bot.js';
import type { GuildMemberAddData } from '../types/gatewayTypes.js';
import { EventHandler } from '../types/types.js';
import Replacers from '../utils/replacers.js';

export default class GuildMemberAddHandler extends EventHandler<GuildMemberAddData> {
    constructor(bot: Bot) {
        super('guild_member_add', bot);
    }

    cacheHandler = (eventData: GuildMemberAddData) => {
        this.bot.cache.members.set(eventData.guild_id, eventData);
        this.bot.cache.users.set(eventData.user);
    };

    handler = async (eventData: GuildMemberAddData) => {
        const settings = await this.bot.db.guild.get(eventData.guild_id, {
            minage: 1,
            'memberLog.channel': 1,
            'memberLog.join': 1,
            'memberLog.joinDM': 1,
        });
        if (!settings) {
            return null;
        }
        const guild = await this.bot.api.guild.fetch(eventData.guild_id);
        if (!guild) {
            this.bot.logger.handleError(
                'guild_member_add',
                'Not performing member actions because guild fetch failed!'
            );
            return null;
        }
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
        // TODO: re-mute if applicable
        // TODO: send to mod member log if configured
        // TODO: add autorole if configured and member isn't "pending"
        // TODO: re-add temproles if applicable
        // TODO: add username to guild nickname history
    };
}
