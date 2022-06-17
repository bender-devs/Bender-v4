import { EventHandler } from '../types/types';
import { ChannelUpdateData, LowercaseEventName } from '../types/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class ChannelUpdateHandler extends EventHandler<ChannelUpdateData> {
    constructor(bot: Bot) {
        super(basename(__filename, '.js') as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: ChannelUpdateData) => {
        this.bot.cache.channels.set(eventData);
    }

    handler = (/*eventData: ChannelUpdateData*/) => {
        // TODO: check for invalid permissions, especially in log channels
    }
}