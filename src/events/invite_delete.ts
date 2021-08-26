import { EventHandler } from "../data/types";
import { InviteDeleteData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";

export default class InviteDeleteHandler extends EventHandler {
    constructor(bot: Bot) {
        super(__filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: InviteDeleteData) => {

    }

    handler = (eventData: InviteDeleteData) => {

    }
}