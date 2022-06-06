import { EventHandler } from '../data/types';
import { ReactionRemoveAllData, LowercaseEventName } from '../data/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class ReactionRemoveAllHandler extends EventHandler<ReactionRemoveAllData> {
    constructor(bot: Bot) {
        super(basename(__filename, '.js') as LowercaseEventName, bot);
    }

    handler = (/*eventData: ReactionRemoveAllData*/) => {
        // event unused for now
    }
}