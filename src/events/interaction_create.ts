import { EventHandler } from "../data/types";
import { InteractionCreateData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";
import { basename } from "path";

export default class InteractionCreateHandler extends EventHandler {
    constructor(bot: Bot) {
        const filename = basename(__filename, '.js');
        super(filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: InteractionCreateData) => {

    }

    handler = (eventData: InteractionCreateData) => {

    }
}