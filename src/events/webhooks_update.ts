import { EventHandler } from "../data/types";
import { WebhooksUpdateData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";

export default class WebhooksUpdateHandler extends EventHandler {
    constructor(bot: Bot) {
        super(__filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: WebhooksUpdateData) => {

    }

    handler = (eventData: WebhooksUpdateData) => {

    }
}