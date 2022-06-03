import { EventHandler } from "../data/types";
import { GuildEmojisUpdateData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";
import { basename } from "path";

export default class GuildEmojisUpdateHandler extends EventHandler {
    constructor(bot: Bot) {
        const filename = basename(__filename, '.js');
        super(filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: GuildEmojisUpdateData) => {
        this.bot.cache.emojis.setAll(eventData.guild_id, eventData.emojis);
    }

    handler = (eventData: GuildEmojisUpdateData) => {

    }
}