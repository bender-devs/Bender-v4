import { EventHandler } from "../data/types";
import { ChannelUpdateData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";

export default class ChannelCreateHandler extends EventHandler {
    constructor(bot: Bot) {
        super(__filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: ChannelUpdateData) => {
        if (!eventData.guild_id) {
            return; // ignore dm channels
        }
        this.bot.cache.channels.set(eventData);
    }

    handler = (eventData: ChannelUpdateData) => {

    }
}