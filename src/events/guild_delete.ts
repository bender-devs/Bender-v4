import { EventHandler } from "../data/types";
import { GuildDeleteData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";

export default class GuildDeleteHandler extends EventHandler {
    constructor(bot: Bot) {
        super(__filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: GuildDeleteData) => {
        if (eventData.unavailable) {
            this.bot.cache.unavailableGuilds.push(eventData.id);
        } else {
            // TODO: extra things when the bot is kicked
        }
        this.bot.cache.guilds.delete(eventData.id);
    }

    handler = (eventData: GuildDeleteData) => {

    }
}