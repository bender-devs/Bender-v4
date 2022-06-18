import { EventHandler } from '../types/types';
import { GuildCreateData, LowercaseEventName } from '../types/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class GuildCreateHandler extends EventHandler<GuildCreateData> {
    constructor(bot: Bot) {
        super(basename(__filename, '.js') as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: GuildCreateData) => {
        if (eventData.unavailable) {
            return; // this shouldn't happen
        }
        this.bot.cache.guilds.create(eventData);

        if (this.bot.cache.unavailableGuilds.includes(eventData.id)) {
            const index = this.bot.cache.unavailableGuilds.indexOf(eventData.id);
            this.bot.cache.unavailableGuilds.splice(index, 1);

            this.bot.logger.debug('GUILD_CREATE', `Guild ${eventData.id} became available`);
        } else {
            // TODO: send intro message for new servers
        }
    }

    // don't use this as we don't know whether it's a new guild here
    handler = () => undefined
}