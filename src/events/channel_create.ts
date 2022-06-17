import { EventHandler } from '../types/types';
import { ChannelUpdateData, LowercaseEventName } from '../types/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class ChannelCreateHandler extends EventHandler<ChannelUpdateData> {
    constructor(bot: Bot) {
        super(basename(__filename, '.js') as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: ChannelUpdateData) => {
        if (!eventData.guild_id) {
            return; // ignore dm channels
        }
        this.bot.cache.channels.set(eventData);
    }

    handler = (/*eventData: ChannelUpdateData*/) => {
        // event unused for now
    }
}