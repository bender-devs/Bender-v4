import { EventHandler } from "../data/types";
import { ChannelUpdateData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";
import { basename } from "path";

export default class ChannelUpdateHandler extends EventHandler {
    constructor(bot: Bot) {
        const filename = basename(__filename, '.js');
        super(filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: ChannelUpdateData) => {
        this.bot.cache.channels.set(eventData);
    }

    handler = (eventData: ChannelUpdateData) => {
        // TODO: check for invalid permissions, especially in log channels
    }
}