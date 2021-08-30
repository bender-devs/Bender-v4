import { EventHandler } from "../data/types";
import { ThreadUpdateData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";

export default class ThreadUpdateHandler extends EventHandler {
    constructor(bot: Bot) {
        super(__filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: ThreadUpdateData) => {
        this.bot.cache.threads.set(eventData);
    }

    handler = (eventData: ThreadUpdateData) => {

    }
}