import { EventHandler } from "../data/types";
import { ReactionRemoveEmojiData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";

export default class ReactionRemoveEmojiHandler extends EventHandler {
    constructor(bot: Bot) {
        super(__filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: ReactionRemoveEmojiData) => {

    }

    handler = (eventData: ReactionRemoveEmojiData) => {

    }
}