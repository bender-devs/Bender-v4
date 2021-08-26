import { EventHandler } from "../data/types";
import { LowercaseEventName, ResumeData } from "../data/gatewayTypes";
import { CLIENT_STATE } from "../data/numberTypes";
import Bot from "../structures/bot";

export default class ResumedHandler extends EventHandler {
    constructor(bot: Bot) {
        super(__filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: ResumeData) => {

    }

    handler = (eventData: ResumeData) => {
        this.bot.state = CLIENT_STATE.ALIVE;
    }
}