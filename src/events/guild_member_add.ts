import MemberLogUtils from '../eventUtils/memberLog.js';
import type Bot from '../structures/bot.js';
import type { ProjectionObject } from '../types/dbTypes.js';
import type { GuildMemberAddData } from '../types/gatewayTypes.js';
import { EventHandler } from '../types/types.js';

export default class GuildMemberAddHandler extends EventHandler<GuildMemberAddData> {
    constructor(bot: Bot) {
        super('guild_member_add', bot);
    }

    cacheHandler = (eventData: GuildMemberAddData) => {
        this.bot.cache.members.set(eventData.guild_id, eventData);
        this.bot.cache.users.set(eventData.user);
    };

    handler = async (eventData: GuildMemberAddData) => {
        const memberLogSettings = MemberLogUtils.SETTINGS.JOIN;
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

        const actionTaken = await this.bot.eventUtils.minAge.join(eventData, guild, settings);
        if (actionTaken) {
            return null; // member has been banned or kicked, no need to continue
        }

        this.bot.eventUtils.memberLog.join(eventData, guild, settings);

        // TODO: send to mod member log if configured
        // TODO: add autorole if configured and member isn't "pending"
        // TODO: re-add temproles if applicable
        // TODO: add username to guild nickname history
    };
}
