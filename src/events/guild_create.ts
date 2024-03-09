import type Bot from '../structures/bot.js';
import type { GuildCreateData } from '../types/gatewayTypes.js';
import { EventHandler } from '../types/types.js';

export default class GuildCreateHandler extends EventHandler<GuildCreateData> {
    constructor(bot: Bot) {
        super('guild_create', bot);
    }

    cacheHandler = (eventData: GuildCreateData) => {
        if (eventData.unavailable) {
            return; // this shouldn't happen
        }
        this.bot.cache.guilds.create(eventData);
        if (eventData.presences?.length) {
            this.bot.cache.presences.addChunk(eventData.presences);
        }

        if (this.bot.cache.unavailableGuilds.includes(eventData.id)) {
            const index = this.bot.cache.unavailableGuilds.indexOf(eventData.id);
            this.bot.cache.unavailableGuilds.splice(index, 1);

            this.bot.logger.debug('GUILD_CREATE', `Guild ${eventData.id} became available`);
        } else {
            // TODO: send intro message for new servers
        }
    };

    // don't use this as we don't know whether it's a new guild here
    handler = () => undefined;
}
