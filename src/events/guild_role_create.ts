import { EventHandler } from '../types/types.js';
import type { GuildRoleUpdateData } from '../types/gatewayTypes.js';
import type Bot from '../structures/bot.js';

export default class GuildRoleCreateHandler extends EventHandler<GuildRoleUpdateData> {
    constructor(bot: Bot) {
        super('guild_role_create', bot);
    }

    cacheHandler = (eventData: GuildRoleUpdateData) => {
        this.bot.cache.roles.set(eventData.guild_id, eventData.role);
    }

    handler = (/*eventData: GuildRoleUpdateData*/) => {
        // event unused for now
    }
}