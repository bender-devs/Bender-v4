import type Bot from '../structures/bot.js';
import type { GuildBanEventData } from '../types/gatewayTypes.js';
import { EventHandler } from '../types/types.js';

export default class GuildBanAddHandler extends EventHandler<GuildBanEventData> {
    constructor(bot: Bot) {
        super('guild_ban_add', bot);
    }

    cacheHandler = (eventData: GuildBanEventData) => {
        this.bot.cache.users.set(eventData.user);
    };

    handler = (/*eventData: GuildBanEventData*/) => {
        // TODO: cache ban to suppress GUILD_MEMBER_REMOVE messages
        // TODO: delete mute for user
        // TODO: if ban messages are enabled, post one, unless the ban is due to namefilter and namefilter.del_welcome !== false
    };
}
