import { EventHandler } from "../data/types";
import { GuildBanEventData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";

export default class GuildBanRemoveHandler extends EventHandler {
    constructor(bot: Bot) {
        super(__filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: GuildBanEventData) => {

    }

    handler = (eventData: GuildBanEventData) => {

    }
}