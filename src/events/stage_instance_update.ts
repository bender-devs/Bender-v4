import { EventHandler } from "../data/types";
import { StageInstanceUpdateData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";

export default class StageInstanceUpdateHandler extends EventHandler {
    constructor(bot: Bot) {
        super(__filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: StageInstanceUpdateData) => {

    }

    handler = (eventData: StageInstanceUpdateData) => {

    }
}