import { EventHandler } from "../data/types";
import { ThreadSyncData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";
import { basename } from "path";

export default class ThreadListSyncHandler extends EventHandler {
    constructor(bot: Bot) {
        const filename = basename(__filename, '.js');
        super(filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: ThreadSyncData) => {

    }

    handler = (eventData: ThreadSyncData) => {

    }
}