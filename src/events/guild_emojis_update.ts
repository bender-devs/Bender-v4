import { EventHandler } from '../types/types.js';
import { GuildEmojisUpdateData } from '../types/gatewayTypes.js';
import Bot from '../structures/bot.js';

export default class GuildEmojisUpdateHandler extends EventHandler<GuildEmojisUpdateData> {
    constructor(bot: Bot) {
        super('guild_emojis_update', bot);
    }

    cacheHandler = (eventData: GuildEmojisUpdateData) => {
        this.bot.cache.emojis.setAll(eventData.guild_id, eventData.emojis);
    }

    handler = (/*eventData: GuildEmojisUpdateData*/) => {
        // event unused for now
    }
}