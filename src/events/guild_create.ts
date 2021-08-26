import { EventHandler } from "../data/types";
import { GuildCreateData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";

export default class GuildCreateHandler extends EventHandler {
    constructor(bot: Bot) {
        super(__filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: GuildCreateData) => {

    }

    handler = (eventData: GuildCreateData) => {

    }
}