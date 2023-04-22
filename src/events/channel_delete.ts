import { EventHandler } from '../types/types.js';
import { ChannelUpdateData } from '../types/gatewayTypes.js';
import Bot from '../structures/bot.js';
import { CHANNEL_TYPES } from '../types/numberTypes.js';

export default class ChannelDeleteHandler extends EventHandler<ChannelUpdateData> {
    constructor(bot: Bot) {
        super('channel_delete', bot);
    }

    cacheHandler = (eventData: ChannelUpdateData) => {
        if (!eventData.guild_id) {
            if (eventData.type === CHANNEL_TYPES.DM && eventData.recipients?.[0].id) {
                this.bot.cache.dmChannels.delete(eventData.recipients[0].id);
            }
            return; // ignore group dm channels
        }
        this.bot.cache.channels.delete(eventData.guild_id, eventData.id);
    }

    handler = (/*eventData: ChannelUpdateData*/) => {
        // TODO: update settings if they have become invalid
    }
}