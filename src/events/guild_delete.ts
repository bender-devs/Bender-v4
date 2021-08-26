import { EventHandler } from "../data/types";
import { GuildDeleteData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";

export default class GuildDeleteHandler extends EventHandler {
    constructor(bot: Bot) {
        super(__filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: GuildDeleteData) => {

    }

    handler = (eventData: GuildDeleteData) => {

    }
}