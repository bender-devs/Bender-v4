import { EventHandler } from '../data/types';
import { ResumedData, LowercaseEventName } from '../data/gatewayTypes';
import { CLIENT_STATE } from '../data/numberTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class ResumedHandler extends EventHandler<ResumedData> {
    requiresReady = false;
    
    constructor(bot: Bot) {
        super(basename(__filename, '.js') as LowercaseEventName, bot);
    }

    cacheHandler = (/*eventData: ResumedData*/) => {
        this.bot.state = CLIENT_STATE.ALIVE;
    }

    handler = (/*eventData: ResumedData*/) => {
        // event unused for now
    }
}