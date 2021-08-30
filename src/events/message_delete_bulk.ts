import { EventHandler } from "../data/types";
import { MessageDeleteBulkData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";

export default class MessageDeleteBulkHandler extends EventHandler {
    constructor(bot: Bot) {
        super(__filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: MessageDeleteBulkData) => {
        if (eventData.guild_id) {
            this.bot.cache.messages.deleteChunk(eventData.guild_id, eventData.channel_id, eventData.ids);
        } else {
            this.bot.cache.dmMessages.deleteChunk(eventData.channel_id, eventData.ids);   
        }
    }

    handler = (eventData: MessageDeleteBulkData) => {

    }
}