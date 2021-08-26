import { EventHandler } from "../data/types";
import { ReactionRemoveAllData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";

export default class ReactionRemoveAllHandler extends EventHandler {
    constructor(bot: Bot) {
        super(__filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: ReactionRemoveAllData) => {

    }

    handler = (eventData: ReactionRemoveAllData) => {

    }
}