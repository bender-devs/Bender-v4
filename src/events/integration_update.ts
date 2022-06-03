import { EventHandler } from "../data/types";
import { IntegrationUpdateData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";
import { basename } from "path";

export default class IntegrationUpdateHandler extends EventHandler {
    constructor(bot: Bot) {
        const filename = basename(__filename, '.js');
        super(filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: IntegrationUpdateData) => {

    }

    handler = (eventData: IntegrationUpdateData) => {

    }
}