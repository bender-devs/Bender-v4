import { EventHandler } from '../types/types.js';
import { ReactionRemoveData } from '../types/gatewayTypes.js';
import Bot from '../structures/bot.js';

export default class ReactionRemoveHandler extends EventHandler<ReactionRemoveData> {
    constructor(bot: Bot) {
        super('message_reaction_remove', bot);
    }

    handler = (/*eventData: ReactionRemoveData*/) => {
        // TODO: handle role menu if applicable and it isn't replaced with interactions

        // TODO: update starboard count if it isn't replaced with interactions
    }
}