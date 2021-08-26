import { EventHandler } from "../data/types";
import { ReactionRemoveData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";

export default class ReactionRemoveHandler extends EventHandler {
    constructor(bot: Bot) {
        super(__filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: ReactionRemoveData) => {

    }

    handler = (eventData: ReactionRemoveData) => {

    }
}