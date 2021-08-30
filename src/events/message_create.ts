import { EventHandler } from "../data/types";
import { MessageCreateData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";

export default class MessageCreateHandler extends EventHandler {
    constructor(bot: Bot) {
        super(__filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: MessageCreateData) => {
        // if message is a dm (no guild_id) and the author has no cached dm channel, cache the channel
        if (!eventData.guild_id && !this.bot.cache.dmChannels.get(eventData.author.id)) {
            this.bot.cache.dmChannels.set(eventData.author.id, eventData.channel_id);
        }
    }

    handler = (eventData: MessageCreateData) => {

    }
}