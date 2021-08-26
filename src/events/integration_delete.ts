import { EventHandler } from "../data/types";
import { IntegrationDeleteData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";

export default class IntegrationDeleteHandler extends EventHandler {
    constructor(bot: Bot) {
        super(__filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: IntegrationDeleteData) => {

    }

    handler = (eventData: IntegrationDeleteData) => {

    }
}