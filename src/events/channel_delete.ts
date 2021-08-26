import { EventHandler } from "../data/types";
import { ChannelUpdateData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";

export default class ChannelDeleteHandler extends EventHandler {
    constructor(bot: Bot) {
        super(__filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: ChannelUpdateData) => {

    }

    handler = (eventData: ChannelUpdateData) => {

    }
}