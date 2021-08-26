import { EventHandler } from "../data/types";
import { GuildIntegrationsUpdateData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";

export default class GuildIntegrationsUpdateHandler extends EventHandler {
    constructor(bot: Bot) {
        super(__filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: GuildIntegrationsUpdateData) => {

    }

    handler = (eventData: GuildIntegrationsUpdateData) => {

    }
}