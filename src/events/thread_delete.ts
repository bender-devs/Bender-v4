import { EventHandler } from '../types/types';
import { ThreadUpdateData, LowercaseEventName } from '../types/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class ThreadDeleteHandler extends EventHandler<ThreadUpdateData> {
    constructor(bot: Bot) {
        super(basename(__filename, '.js') as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: ThreadUpdateData) => {
        this.bot.cache.threads.delete(eventData.guild_id, eventData.id);
    }

    handler = (/*eventData: ThreadUpdateData*/) => {
        // event unused for now
    }
}