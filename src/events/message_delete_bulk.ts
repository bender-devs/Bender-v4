import { EventHandler } from '../types/types.js';
import { MessageDeleteBulkData } from '../types/gatewayTypes.js';
import Bot from '../structures/bot.js';

export default class MessageDeleteBulkHandler extends EventHandler<MessageDeleteBulkData> {
    constructor(bot: Bot) {
        super('message_delete_bulk', bot);
    }

    cacheHandler = (eventData: MessageDeleteBulkData) => {
        if (eventData.guild_id) {
            this.bot.cache.messages.deleteChunk(eventData.guild_id, eventData.channel_id, eventData.ids);
        } else {
            this.bot.cache.dmMessages.deleteChunk(eventData.channel_id, eventData.ids);   
        }
    }

    handler = (/*eventData: MessageDeleteBulkData*/) => {
        // TODO: if delete logging is enabled, post to log channel
    }
}