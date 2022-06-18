import { EventHandler } from '../types/types';
import { ReactionRemoveData, LowercaseEventName } from '../types/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class ReactionRemoveHandler extends EventHandler<ReactionRemoveData> {
    constructor(bot: Bot) {
        super(basename(__filename, '.js') as LowercaseEventName, bot);
    }

    handler = (/*eventData: ReactionRemoveData*/) => {
        // TODO: handle role menu if applicable and it isn't replaced with interactions

        // TODO: update starboard count if it isn't replaced with interactions
    }
}