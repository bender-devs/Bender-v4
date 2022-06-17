import { EventHandler } from '../types/types';
import { ReactionRemoveData, LowercaseEventName } from '../types/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class ReactionRemoveHandler extends EventHandler<ReactionRemoveData> {
    constructor(bot: Bot) {
        super(basename(__filename, '.js') as LowercaseEventName, bot);
    }

    handler = (/*eventData: ReactionRemoveData*/) => {
        // TODO: handle role menus and giveaways if applicable
    }
}