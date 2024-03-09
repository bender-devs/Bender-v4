import type Bot from '../structures/bot.js';
import type { ResumedData } from '../types/gatewayTypes.js';
import { CLIENT_STATE } from '../types/numberTypes.js';
import { EventHandler } from '../types/types.js';

export default class ResumedHandler extends EventHandler<ResumedData> {
    requiresReady = false;

    constructor(bot: Bot) {
        super('resumed', bot);
    }

    cacheHandler = (/*eventData: ResumedData*/) => {
        this.bot.state = CLIENT_STATE.ALIVE;
    };

    handler = (/*eventData: ResumedData*/) => {
        // event unused for now
    };
}
