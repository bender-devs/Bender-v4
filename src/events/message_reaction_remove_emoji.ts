import type Bot from '../structures/bot.js';
import type { ReactionRemoveEmojiData } from '../types/gatewayTypes.js';
import { EventHandler } from '../types/types.js';

export default class ReactionRemoveEmojiHandler extends EventHandler<ReactionRemoveEmojiData> {
    constructor(bot: Bot) {
        super('message_reaction_remove_emoji', bot);
    }

    handler = (/*eventData: ReactionRemoveEmojiData*/) => {
        // event unused for now
    };
}
