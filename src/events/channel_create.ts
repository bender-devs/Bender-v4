import { EventHandler } from "../data/types";
import { ChannelUpdateData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";
import { basename } from "path";

export default class ChannelCreateHandler extends EventHandler {
    constructor(bot: Bot) {
        const filename = basename(__filename, '.js');
        super(filename as LowercaseEventName, bot);
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