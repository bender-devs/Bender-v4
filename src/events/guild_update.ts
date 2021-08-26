import { EventHandler } from "../data/types";
import { GuildUpdateData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";

export default class GuildUpdateHandler extends EventHandler {
    constructor(bot: Bot) {
        super(__filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: GuildUpdateData) => {

    }

    handler = (eventData: GuildUpdateData) => {

    }
}