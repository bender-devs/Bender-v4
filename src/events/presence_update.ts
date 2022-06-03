import { EventHandler } from "../data/types";
import { PresenceUpdateData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";
import { basename } from "path";

export default class PresenceUpdateHandler extends EventHandler {
    constructor(bot: Bot) {
        const filename = basename(__filename, '.js');
        super(filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: PresenceUpdateData) => {

    }

    handler = (eventData: PresenceUpdateData) => {

    }
}