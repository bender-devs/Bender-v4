import { EventHandler } from '../types/types';
import { UserUpdateData, LowercaseEventName } from '../types/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class UserUpdateHandler extends EventHandler<UserUpdateData> {
    constructor(bot: Bot) {
        super(basename(__filename, '.js') as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: UserUpdateData) => {
        this.bot.cache.users.set(eventData);
    }

    handler = (/*eventData: UserUpdateData*/) => {
        // TODO: if user hasn't opted out, save username history

        // TODO: handle namefilter in all guilds

        // TODO: handle username update logging in all guilds

        // TODO: handle avatar update logging in all guilds
    }
}