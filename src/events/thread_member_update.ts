import { EventHandler } from "../data/types";
import { ThreadMemberUpdateData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";

export default class ThreadMemberUpdateHandler extends EventHandler {
    constructor(bot: Bot) {
        super(__filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: ThreadMemberUpdateData) => {

    }

    handler = (eventData: ThreadMemberUpdateData) => {

    }
}