import { EventHandler } from "../data/types";
import { ThreadSyncData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";

export default class ThreadListSyncHandler extends EventHandler {
    constructor(bot: Bot) {
        super(__filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: ThreadSyncData) => {

    }

    handler = (eventData: ThreadSyncData) => {

    }
}