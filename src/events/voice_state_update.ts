import { EventHandler } from "../data/types";
import { VoiceStateUpdateData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";

export default class VoiceStateUpdateHandler extends EventHandler {
    constructor(bot: Bot) {
        super(__filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: VoiceStateUpdateData) => {

    }

    handler = (eventData: VoiceStateUpdateData) => {

    }
}