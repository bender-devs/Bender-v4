import { EventHandler } from "../data/types";
import { IntegrationUpdateData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";

export default class IntegrationUpdateHandler extends EventHandler {
    constructor(bot: Bot) {
        super(__filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: IntegrationUpdateData) => {

    }

    handler = (eventData: IntegrationUpdateData) => {

    }
}