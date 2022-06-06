import { EventHandler } from '../data/types';
import { GuildRoleUpdateData, LowercaseEventName } from '../data/gatewayTypes';
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