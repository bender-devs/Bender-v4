import { EventHandler } from '../types/types';
import { GuildRoleUpdateData, LowercaseEventName } from '../types/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class GuildRoleCreateHandler extends EventHandler<GuildRoleUpdateData> {
    constructor(bot: Bot) {
        super(basename(__filename, '.js') as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: GuildRoleUpdateData) => {
        this.bot.cache.roles.set(eventData.guild_id, eventData.role);
    }

    handler = (/*eventData: GuildRoleUpdateData*/) => {
        // event unused for now
    }
}