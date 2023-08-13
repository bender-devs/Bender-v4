import { EventHandler } from '../types/types.js';
import type { GuildRoleUpdateData } from '../types/gatewayTypes.js';
import type Bot from '../structures/bot.js';

export default class GuildRoleUpdateHandler extends EventHandler<GuildRoleUpdateData> {
    constructor(bot: Bot) {
        super('guild_role_update', bot);
    }

    cacheHandler = (eventData: GuildRoleUpdateData) => {
        this.bot.cache.roles.set(eventData.guild_id, eventData.role);
    }

    handler = (/*eventData: GuildRoleUpdateData*/) => {
        // TODO: check if settings are invalid? (may not be needed if agreement/mutes aren't used)
    }
}