import type Bot from '../structures/bot.js';
import type { UserUpdateData } from '../types/gatewayTypes.js';
import { EventHandler } from '../types/types.js';

export default class UserUpdateHandler extends EventHandler<UserUpdateData> {
    constructor(bot: Bot) {
        super('user_update', bot);
    }

    cacheHandler = (eventData: UserUpdateData) => {
        this.bot.cache.users.set(eventData);
    };

    handler = (/*eventData: UserUpdateData*/) => {
        // TODO: if user hasn't opted out, save username history
        // TODO: handle namefilter in all guilds
        // TODO: handle username update logging in all guilds
        // TODO: handle avatar update logging in all guilds
    };
}
