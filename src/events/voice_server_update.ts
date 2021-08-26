import { EventHandler } from "../data/types";
import { VoiceServerUpdateData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";

export default class VoiceServerUpdateHandler extends EventHandler {
    constructor(bot: Bot) {
        super(__filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: VoiceServerUpdateData) => {

    }

    handler = (eventData: VoiceServerUpdateData) => {

    }
}