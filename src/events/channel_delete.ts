import { EventHandler } from '../data/types';
import { ChannelUpdateData, LowercaseEventName } from '../data/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class ChannelDeleteHandler extends EventHandler<ChannelUpdateData> {
    constructor(bot: Bot) {
        const filename = basename(__filename, '.js');
        super(filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: ChannelUpdateData) => {
        if (!eventData.guild_id) {
            return; // ignore dm channels
        }
        this.bot.cache.channels.delete(eventData.guild_id, eventData.id);
    }

    handler = (/*eventData: ChannelUpdateData*/) => {
        // TODO: update settings if they have become invalid
    }
}