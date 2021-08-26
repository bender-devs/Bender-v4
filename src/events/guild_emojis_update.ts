import { EventHandler } from "../data/types";
import { GuildEmojisUpdateData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";

export default class GuildEmojisUpdateHandler extends EventHandler {
    constructor(bot: Bot) {
        super(__filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: GuildEmojisUpdateData) => {

    }

    handler = (eventData: GuildEmojisUpdateData) => {

    }
}