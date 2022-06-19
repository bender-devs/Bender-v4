import { EventHandler } from '../types/types';
import { GuildBanEventData, LowercaseEventName } from '../types/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class GuildBanAddHandler extends EventHandler<GuildBanEventData> {
    constructor(bot: Bot) {
        super(basename(__filename, '.js') as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: GuildBanEventData) => {
        this.bot.cache.users.set(eventData.user);
    }

    handler = (/*eventData: GuildBanEventData*/) => {
        // TODO: cache ban to suppress GUILD_MEMBER_REMOVE messages

        // TODO: delete mute for user

        // TODO: if ban messages are enabled, post one, unless the ban is due to namefilter and namefilter.del_welcome !== false
    }
}