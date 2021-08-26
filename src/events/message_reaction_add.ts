import { EventHandler } from "../data/types";
import { ReactionAddData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";

export default class ReactionAddHandler extends EventHandler {
    constructor(bot: Bot) {
        super(__filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: ReactionAddData) => {

    }

    handler = (eventData: ReactionAddData) => {

    }
}