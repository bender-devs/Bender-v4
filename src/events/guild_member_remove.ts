import MemberLogUtils from '../eventUtils/memberLog.js';
import type Bot from '../structures/bot.js';
import type { ProjectionObject } from '../types/dbTypes.js';
import type { GuildMemberRemoveData } from '../types/gatewayTypes.js';
import { EventHandler } from '../types/types.js';

export default class GuildMemberRemoveHandler extends EventHandler<GuildMemberRemoveData> {
    constructor(bot: Bot) {
        super('guild_member_remove', bot);
    }

    cacheHandler = (eventData: GuildMemberRemoveData) => {
        this.bot.cache.members.delete(eventData.guild_id, eventData.user.id);
        this.bot.cache.users.set(eventData.user);
    };

    handler = async (eventData: GuildMemberRemoveData) => {
        const fields: ProjectionObject = {};
        for (const setting of MemberLogUtils.SETTINGS.LEAVE) {
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

        // TODO: check ban cache to avoid sending these messages for banned members
        this.bot.eventUtils.memberLog.leave(eventData, guild, settings);
        // TODO: send to mod member log if configured
    };
}
