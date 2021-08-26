import { EventHandler } from "../data/types";
import { CommandUpdateData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";

export default class CommandUpdateHandler extends EventHandler {
    constructor(bot: Bot) {
        super(__filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: CommandUpdateData) => {

    }

    handler = (eventData: CommandUpdateData) => {

    }
}