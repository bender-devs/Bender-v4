import { EventHandler } from "../data/types";
import { ThreadMembersUpdateData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";

export default class ThreadMembersUpdateHandler extends EventHandler {
    constructor(bot: Bot) {
        super(__filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: ThreadMembersUpdateData) => {

    }

    handler = (eventData: ThreadMembersUpdateData) => {

    }
}