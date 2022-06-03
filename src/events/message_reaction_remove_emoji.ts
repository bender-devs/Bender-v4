import { EventHandler } from "../data/types";
import { ReactionRemoveEmojiData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";
import { basename } from "path";

export default class ReactionRemoveEmojiHandler extends EventHandler {
    constructor(bot: Bot) {
        const filename = basename(__filename, '.js');
        super(filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: ReactionRemoveEmojiData) => {

    }

    handler = (eventData: ReactionRemoveEmojiData) => {

    }
}