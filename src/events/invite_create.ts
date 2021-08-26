import { EventHandler } from "../data/types";
import { InviteCreateData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";

export default class InviteCreateHandler extends EventHandler {
    constructor(bot: Bot) {
        super(__filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: InviteCreateData) => {

    }

    handler = (eventData: InviteCreateData) => {

    }
}