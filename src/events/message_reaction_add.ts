import { EventHandler } from '../types/types';
import { ReactionAddData, LowercaseEventName } from '../types/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class ReactionAddHandler extends EventHandler<ReactionAddData> {
    constructor(bot: Bot) {
        super(basename(__filename, '.js') as LowercaseEventName, bot);
    }

    handler = (/*eventData: ReactionAddData*/) => {
        // TODO: deal with agreement, if the emoji message is set and that feature isn't replaced by member screening or converted to interactions

        // TODO: handle role menus & giveaways, if those aren't replaced with interactions

        // TODO: handle starboard if it isn't replaced with interactions
    }
}