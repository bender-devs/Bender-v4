import { EventHandler } from '../types/types';
import { ReactionRemoveEmojiData, LowercaseEventName } from '../types/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class ReactionRemoveEmojiHandler extends EventHandler<ReactionRemoveEmojiData> {
    constructor(bot: Bot) {
        super(basename(__filename, '.js') as LowercaseEventName, bot);
    }

    handler = (/*eventData: ReactionRemoveEmojiData*/) => {
        // event unused for now
    }
}