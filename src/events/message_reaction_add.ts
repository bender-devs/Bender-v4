import { EventHandler } from '../types/types';
import { ReactionAddData, LowercaseEventName } from '../types/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class ReactionAddHandler extends EventHandler<ReactionAddData> {
    constructor(bot: Bot) {
        super(basename(__filename, '.js') as LowercaseEventName, bot);
    }

    handler = (/*eventData: ReactionAddData*/) => {
        // TODO: code for role menus & giveaways (if those aren't replaced with interactions)
    }
}