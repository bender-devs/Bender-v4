import type Bot from '../structures/bot.js';
import type { ReactionAddData } from '../types/gatewayTypes.js';
import { EventHandler } from '../types/types.js';

export default class ReactionAddHandler extends EventHandler<ReactionAddData> {
    constructor(bot: Bot) {
        super('message_reaction_add', bot);
    }

    handler = (/*eventData: ReactionAddData*/) => {
        // TODO: deal with agreement, if the emoji message is set and that feature isn't replaced by member screening or converted to interactions
        // TODO: handle role menus & giveaways, if those aren't replaced with interactions
        // TODO: handle starboard if it isn't replaced with interactions
    };
}
