import type Bot from '../structures/bot.js';
import type { ThreadUpdateData } from '../types/gatewayTypes.js';
import { EventHandler } from '../types/types.js';

export default class ThreadUpdateHandler extends EventHandler<ThreadUpdateData> {
    constructor(bot: Bot) {
        super('thread_update', bot);
    }

    cacheHandler = (eventData: ThreadUpdateData) => {
        this.bot.cache.threads.create(eventData);
    };

    handler = (/*eventData: ThreadUpdateData*/) => {
        // event unused for now
    };
}
