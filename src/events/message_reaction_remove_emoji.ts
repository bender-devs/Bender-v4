import { EventHandler } from '../types/types.js';
import { ReactionRemoveEmojiData } from '../types/gatewayTypes.js';
import Bot from '../structures/bot.js';

export default class ReactionRemoveEmojiHandler extends EventHandler<ReactionRemoveEmojiData> {
    constructor(bot: Bot) {
        super('message_reaction_remove_emoji', bot);
    }

    handler = (/*eventData: ReactionRemoveEmojiData*/) => {
        // event unused for now
    }
}