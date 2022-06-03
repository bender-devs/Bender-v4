import { EventHandler } from "../data/types";
import { MessageCreateData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";
import { basename } from "path";

export default class MessageCreateHandler extends EventHandler {
    constructor(bot: Bot) {
        const filename = basename(__filename, '.js');
        super(filename as LowercaseEventName, bot);
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