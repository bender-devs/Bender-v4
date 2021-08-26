import { EventHandler } from "../data/types";
import { LowercaseEventName, ReadyData } from "../data/gatewayTypes";
import { CLIENT_STATE } from "../data/numberTypes";
import Bot from "../structures/bot";

export default class ReadyHandler extends EventHandler {
    constructor(bot: Bot) {
        super(__filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: ReadyData) => {

    }

    handler = (eventData: ReadyData) => {
        this.bot.state = CLIENT_STATE.ALIVE;
    }
}