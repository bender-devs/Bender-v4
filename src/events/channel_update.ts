import { EventHandler } from '../types/types.js';
import type { ChannelUpdateData } from '../types/gatewayTypes.js';
import type Bot from '../structures/bot.js';

export default class ChannelUpdateHandler extends EventHandler<ChannelUpdateData> {
    constructor(bot: Bot) {
        super('channel_update', bot);
    }

    cacheHandler = (eventData: ChannelUpdateData) => {
        this.bot.cache.channels.create(eventData);
    }

    handler = (/*eventData: ChannelUpdateData*/) => {
        // TODO: check for invalid permissions, especially in log channels
    }
}