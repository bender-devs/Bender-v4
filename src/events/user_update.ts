import { EventHandler } from '../types/types';
import { UserUpdateData, LowercaseEventName } from '../types/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class UserUpdateHandler extends EventHandler<UserUpdateData> {
    constructor(bot: Bot) {
        super(basename(__filename, '.js') as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: UserUpdateData) => {
        this.bot.cache.users.create(eventData);
    }

    handler = (/*eventData: UserUpdateData*/) => {
        // event unused for now
    }
}