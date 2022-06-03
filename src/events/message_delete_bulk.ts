import { EventHandler } from "../data/types";
import { MessageDeleteBulkData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";
import { basename } from "path";

export default class MessageDeleteBulkHandler extends EventHandler {
    constructor(bot: Bot) {
        const filename = basename(__filename, '.js');
        super(filename as LowercaseEventName, bot);
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