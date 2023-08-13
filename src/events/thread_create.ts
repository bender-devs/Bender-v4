import { EventHandler } from '../types/types.js';
import type { ThreadUpdateData } from '../types/gatewayTypes.js';
import type Bot from '../structures/bot.js';

export default class ThreadCreateHandler extends EventHandler<ThreadUpdateData> {
    constructor(bot: Bot) {
        super('thread_create', bot);
    }

    cacheHandler = (eventData: ThreadUpdateData) => {
        this.bot.cache.threads.create(eventData);
    }

    handler = (/*eventData: ThreadUpdateData*/) => {
        // TODO: join thread if auto-join setting is enabled
    }
}