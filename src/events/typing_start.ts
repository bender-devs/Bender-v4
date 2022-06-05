import { EventHandler } from '../data/types';
import { TypingStartData, LowercaseEventName } from '../data/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class TypingStartHandler extends EventHandler<TypingStartData> {
    constructor(bot: Bot) {
        const filename = basename(__filename, '.js');
        super(filename as LowercaseEventName, bot);
    }

    handler = (/*eventData: TypingStartData*/) => {
        // event unused for now
    }
}