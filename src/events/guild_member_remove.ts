import type Bot from '../structures/bot.js';
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

    handler = (/*eventData: GuildMemberRemoveData*/) => {
        // TODO: check ban cache to avoid sending these messages for banned members
        // TODO: send to member log if configured
        // TODO: send to mod member log if configured
    };
}
