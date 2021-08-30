import { EventHandler } from "../data/types";
import { ChannelUpdateData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";

export default class ChannelDeleteHandler extends EventHandler {
    constructor(bot: Bot) {
        super(__filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: ChannelUpdateData) => {
        if (!eventData.guild_id) {
            return; // ignore dm channels
        }
        this.bot.cache.channels.delete(eventData.guild_id, eventData.id);
    }

    handler = (eventData: ChannelUpdateData) => {
        // TODO: update settings if they have become invalid
    }
}