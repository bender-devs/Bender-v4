import { EventHandler } from "../data/types";
import { MessageDeleteData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";

export default class MessageDeleteHandler extends EventHandler {
    constructor(bot: Bot) {
        super(__filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: MessageDeleteData) => {
        if (eventData.guild_id) {
            this.bot.cache.messages.delete(eventData.guild_id, eventData.channel_id, eventData.id);
        } else {
            this.bot.cache.dmMessages.delete(eventData.channel_id, eventData.id);
        }
    }

    handler = (eventData: MessageDeleteData) => {

    }
}