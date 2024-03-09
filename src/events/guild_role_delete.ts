import type Bot from '../structures/bot.js';
import type { GuildRoleDeleteData } from '../types/gatewayTypes.js';
import { EventHandler } from '../types/types.js';

export default class GuildRoleDeleteHandler extends EventHandler<GuildRoleDeleteData> {
    constructor(bot: Bot) {
        super('guild_role_delete', bot);
    }

    cacheHandler = (eventData: GuildRoleDeleteData) => {
        this.bot.cache.roles.delete(eventData.guild_id, eventData.role_id);
    };

    handler = (/*eventData: GuildRoleDeleteData*/) => {
        // TODO: check if settings are invalid? (may not be needed if agreement/mutes aren't used)
    };
}
