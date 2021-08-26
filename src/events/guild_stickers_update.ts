import { EventHandler } from "../data/types";
import { GuildStickersUpdateData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";

export default class GuildStickersUpdateHandler extends EventHandler {
    constructor(bot: Bot) {
        super(__filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: GuildStickersUpdateData) => {

    }

    handler = (eventData: GuildStickersUpdateData) => {

    }
}