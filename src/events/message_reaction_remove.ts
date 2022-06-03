import { EventHandler } from "../data/types";
import { ReactionRemoveData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";
import { basename } from "path";

export default class ReactionRemoveHandler extends EventHandler {
    constructor(bot: Bot) {
        const filename = basename(__filename, '.js');
        super(filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: ReactionRemoveData) => {

    }

    handler = (eventData: ReactionRemoveData) => {

    }
}