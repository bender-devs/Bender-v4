import { EventHandler } from "../data/types";
import { VoiceServerUpdateData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";
import { basename } from "path";

export default class VoiceServerUpdateHandler extends EventHandler {
    constructor(bot: Bot) {
        const filename = basename(__filename, '.js');
        super(filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: VoiceServerUpdateData) => {

    }

    handler = (eventData: VoiceServerUpdateData) => {

    }
}