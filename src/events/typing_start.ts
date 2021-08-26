import { EventHandler } from "../data/types";
import { TypingStartData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";

export default class TypingStartHandler extends EventHandler {
    constructor(bot: Bot) {
        super(__filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: TypingStartData) => {

    }

    handler = (eventData: TypingStartData) => {

    }
}