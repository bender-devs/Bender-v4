import { EventHandler } from "../data/types";
import { ChannelPinsUpdateData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";

export default class ChannelPinsUpdateHandler extends EventHandler {
    constructor(bot: Bot) {
        super(__filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: ChannelPinsUpdateData) => {

    }

    handler = (eventData: ChannelPinsUpdateData) => {

    }
}