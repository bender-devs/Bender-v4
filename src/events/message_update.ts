import { EventHandler } from "../data/types";
import { MessageUpdateData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";
import { basename } from "path";

export default class MessageUpdateHandler extends EventHandler {
    constructor(bot: Bot) {
        const filename = basename(__filename, '.js');
        super(filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: MessageUpdateData) => {
        if (eventData.guild_id) {
            this.bot.cache.messages.update(eventData);
        } else {
            this.bot.cache.dmMessages.update(eventData);
        }
    }

    handler = (eventData: MessageUpdateData) => {

    }
}