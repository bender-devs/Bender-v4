import { EventHandler } from "../data/types";
import { GuildStickersUpdateData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";
import { basename } from "path";

export default class GuildStickersUpdateHandler extends EventHandler {
    constructor(bot: Bot) {
        const filename = basename(__filename, '.js');
        super(filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: GuildStickersUpdateData) => {

    }

    handler = (eventData: GuildStickersUpdateData) => {

    }
}