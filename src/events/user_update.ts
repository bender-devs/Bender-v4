import { EventHandler } from '../data/types';
import { UserUpdateData, LowercaseEventName } from '../data/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class UserUpdateHandler extends EventHandler<UserUpdateData> {
    constructor(bot: Bot) {
        super(basename(__filename, '.js') as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: UserUpdateData) => {
        this.bot.cache.users.set(eventData.id, eventData);
    }

    handler = (/*eventData: UserUpdateData*/) => {
        // event unused for now
    }
}