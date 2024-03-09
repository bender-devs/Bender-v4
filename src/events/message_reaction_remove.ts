import type Bot from '../structures/bot.js';
import type { ReactionRemoveData } from '../types/gatewayTypes.js';
import { EventHandler } from '../types/types.js';

export default class ReactionRemoveHandler extends EventHandler<ReactionRemoveData> {
    constructor(bot: Bot) {
        super('message_reaction_remove', bot);
    }

    handler = (/*eventData: ReactionRemoveData*/) => {
        // TODO: handle role menu if applicable and it isn't replaced with interactions
        // TODO: update starboard count if it isn't replaced with interactions
    };
}
