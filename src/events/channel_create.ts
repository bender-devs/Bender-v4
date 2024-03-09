import type Bot from '../structures/bot.js';
import type { ChannelUpdateData } from '../types/gatewayTypes.js';
import { EventHandler } from '../types/types.js';

export default class ChannelCreateHandler extends EventHandler<ChannelUpdateData> {
    constructor(bot: Bot) {
        super('channel_create', bot);
    }

    cacheHandler = (eventData: ChannelUpdateData) => {
        if (!eventData.guild_id) {
            return; // ignore dm channels
        }
        this.bot.cache.channels.create(eventData);
    };

    handler = (/*eventData: ChannelUpdateData*/) => {
        // event unused for now
    };
}
