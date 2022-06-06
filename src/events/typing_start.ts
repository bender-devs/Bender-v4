import { EventHandler } from '../data/types';
import { TypingStartData, LowercaseEventName } from '../data/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class TypingStartHandler extends EventHandler<TypingStartData> {
    constructor(bot: Bot) {
        super(basename(__filename, '.js') as LowercaseEventName, bot);
    }

    handler = (/*eventData: TypingStartData*/) => {
        // event unused for now
    }
}