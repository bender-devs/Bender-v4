import { EventHandler } from '../data/types';
import { GuildDeleteData, LowercaseEventName } from '../data/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class GuildDeleteHandler extends EventHandler<GuildDeleteData> {
    constructor(bot: Bot) {
        super(basename(__filename, '.js') as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: GuildDeleteData) => {
        if (eventData.unavailable) {
            this.bot.cache.unavailableGuilds.push(eventData.id);
        } else {
            // TODO: extra things when the bot is kicked
        }
        this.bot.cache.guilds.delete(eventData.id);
    }

    handler = (/*eventData: GuildDeleteData*/) => {
        // event unused for now
    }
}