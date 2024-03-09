import type Bot from '../structures/bot.js';
import type { GuildEmojisUpdateData } from '../types/gatewayTypes.js';
import { EventHandler } from '../types/types.js';

export default class GuildEmojisUpdateHandler extends EventHandler<GuildEmojisUpdateData> {
    constructor(bot: Bot) {
        super('guild_emojis_update', bot);
    }

    cacheHandler = (eventData: GuildEmojisUpdateData) => {
        this.bot.cache.emojis.setAll(eventData.guild_id, eventData.emojis);
    };

    handler = (/*eventData: GuildEmojisUpdateData*/) => {
        // event unused for now
    };
}
