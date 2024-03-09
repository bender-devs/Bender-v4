import type Bot from '../structures/bot.js';
import type { ReactionRemoveAllData } from '../types/gatewayTypes.js';
import { EventHandler } from '../types/types.js';

export default class ReactionRemoveAllHandler extends EventHandler<ReactionRemoveAllData> {
    constructor(bot: Bot) {
        super('message_reaction_remove_all', bot);
    }

    handler = (/*eventData: ReactionRemoveAllData*/) => {
        // event unused for now
    };
}
