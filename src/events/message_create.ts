import { EventHandler } from "../data/types";
import { MessageCreateData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";

export default class MessageCreateHandler extends EventHandler {
    constructor(bot: Bot) {
        super(__filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: MessageCreateData) => {
        if (eventData.guild_id) {
            this.bot.cache.messages.set(eventData);
        } else {
            this.bot.cache.dmMessages.set(eventData);
        }
    }

    handler = (eventData: MessageCreateData) => {

    }
}