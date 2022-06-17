import { EventHandler } from '../types/types';
import { GuildRoleDeleteData, LowercaseEventName } from '../types/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class GuildRoleDeleteHandler extends EventHandler<GuildRoleDeleteData> {
    constructor(bot: Bot) {
        super(basename(__filename, '.js') as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: GuildRoleDeleteData) => {
        this.bot.cache.roles.delete(eventData.guild_id, eventData.role_id);
    }

    handler = (/*eventData: GuildRoleDeleteData*/) => {
        // TODO: check if settings are invalid? (may not be needed if agreement/mutes aren't used)
    }
}