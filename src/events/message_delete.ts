import { EventHandler } from "../data/types";
import { MessageDeleteData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";

export default class MessageDeleteHandler extends EventHandler {
    constructor(bot: Bot) {
        super(__filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: MessageDeleteData) => {

    }

    handler = (eventData: MessageDeleteData) => {

    }
}