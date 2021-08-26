import { EventHandler } from "../data/types";
import { InteractionCreateData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";

export default class InteractionCreateHandler extends EventHandler {
    constructor(bot: Bot) {
        super(__filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: InteractionCreateData) => {

    }

    handler = (eventData: InteractionCreateData) => {

    }
}