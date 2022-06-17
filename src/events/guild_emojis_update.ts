import { EventHandler } from '../types/types';
import { GuildEmojisUpdateData, LowercaseEventName } from '../types/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class GuildEmojisUpdateHandler extends EventHandler<GuildEmojisUpdateData> {
    constructor(bot: Bot) {
        super(basename(__filename, '.js') as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: GuildEmojisUpdateData) => {
        this.bot.cache.emojis.setAll(eventData.guild_id, eventData.emojis);
    }

    handler = (/*eventData: GuildEmojisUpdateData*/) => {
        // event unused for now
    }
}