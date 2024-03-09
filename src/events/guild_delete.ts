import type Bot from '../structures/bot.js';
import type { GuildDeleteData } from '../types/gatewayTypes.js';
import { EventHandler } from '../types/types.js';

export default class GuildDeleteHandler extends EventHandler<GuildDeleteData> {
    constructor(bot: Bot) {
        super('guild_delete', bot);
    }

    cacheHandler = (eventData: GuildDeleteData) => {
        if (eventData.unavailable) {
            this.bot.cache.unavailableGuilds.push(eventData.id);
        } else {
            // TODO: extra things when the bot is kicked
        }
        this.bot.cache.guilds.delete(eventData.id);
    };

    handler = (/*eventData: GuildDeleteData*/) => {
        // TODO: remove premium status if applicable so it doesn't get "stuck"
    };
}
