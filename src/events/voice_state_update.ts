import { EventHandler } from "../data/types";
import { VoiceStateUpdateData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";
import { basename } from "path";

export default class VoiceStateUpdateHandler extends EventHandler {
    constructor(bot: Bot) {
        const filename = basename(__filename, '.js');
        super(filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: VoiceStateUpdateData) => {

    }

    handler = (eventData: VoiceStateUpdateData) => {

    }
}