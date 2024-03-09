import type Bot from '../structures/bot.js';
import type { ThreadSyncData } from '../types/gatewayTypes.js';
import { EventHandler } from '../types/types.js';

export default class ThreadListSyncHandler extends EventHandler<ThreadSyncData> {
    constructor(bot: Bot) {
        super('thread_list_sync', bot);
    }

    cacheHandler = (eventData: ThreadSyncData) => {
        this.bot.cache.threads.sync(eventData);
    };

    handler = (/*eventData: ThreadSyncData*/) => {
        // TODO: join thread if any new threads were added and auto-join setting is enabled
    };
}
