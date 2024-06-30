import MemberLogUtils from '../eventUtils/memberLog.js';
import type Bot from '../structures/bot.js';
import type { ProjectionObject } from '../types/dbTypes.js';
import type { GuildBanEventData } from '../types/gatewayTypes.js';
import { EventHandler } from '../types/types.js';

export default class GuildBanAddHandler extends EventHandler<GuildBanEventData> {
    constructor(bot: Bot) {
        super('guild_ban_add', bot);
    }

    cacheHandler = (eventData: GuildBanEventData) => {
        this.bot.cache.users.set(eventData.user);
    };

    handler = async (eventData: GuildBanEventData) => {
        // TODO: cache ban to suppress GUILD_MEMBER_REMOVE messages

        const memberLogSettings = MemberLogUtils.SETTINGS.BAN;
        const fields: ProjectionObject = {};
        for (const setting of memberLogSettings) {
            fields[setting] = 1;
        }

        const settings = await this.bot.db.guild.get(eventData.guild_id, fields);
        if (!settings) {
            return null;
        }
        const guild = await this.bot.api.guild.fetch(eventData.guild_id);
        if (!guild) {
            this.bot.logger.handleError(this.name, 'Not performing member actions because guild fetch failed!');
            return null;
        }

        this.bot.eventUtils.memberLog.ban(eventData, guild, settings);
    };
}
