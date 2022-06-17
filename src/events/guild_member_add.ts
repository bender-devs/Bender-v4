import { EventHandler } from '../types/types';
import { GuildMemberAddData, LowercaseEventName } from '../types/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class GuildMemberAddHandler extends EventHandler<GuildMemberAddData> {
    constructor(bot: Bot) {
        super(basename(__filename, '.js') as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: GuildMemberAddData) => {
        this.bot.cache.members.set(eventData.guild_id, eventData);
    }

    handler = (/*eventData: GuildMemberAddData*/) => {
        // TODO: send join DM if configured
        // TODO: send to member log if configured
        // TODO: send to mod member log if configured
    }
}