import type Bot from '../structures/bot.js';
import type { ThreadUpdateData } from '../types/gatewayTypes.js';
import { EventHandler } from '../types/types.js';

export default class ThreadDeleteHandler extends EventHandler<ThreadUpdateData> {
    constructor(bot: Bot) {
        super('thread_delete', bot);
    }

    cacheHandler = (eventData: ThreadUpdateData) => {
        this.bot.cache.threads.delete(eventData.guild_id, eventData.id);
    };

    handler = (/*eventData: ThreadUpdateData*/) => {
        // event unused for now
    };
}
