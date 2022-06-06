import { EventHandler } from '../data/types';
import { ThreadUpdateData, LowercaseEventName } from '../data/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class ThreadCreateHandler extends EventHandler<ThreadUpdateData> {
    constructor(bot: Bot) {
        super(basename(__filename, '.js') as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: ThreadUpdateData) => {
        this.bot.cache.threads.set(eventData);
    }

    handler = (/*eventData: ThreadUpdateData*/) => {
        // TODO: join thread if auto-join setting is enabled
    }
}