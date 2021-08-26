import { EventHandler } from "../data/types";
import { PresenceUpdateData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";

export default class PresenceUpdateHandler extends EventHandler {
    constructor(bot: Bot) {
        super(__filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: PresenceUpdateData) => {

    }

    handler = (eventData: PresenceUpdateData) => {

    }
}