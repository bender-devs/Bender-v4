import { EventHandler } from '../types/types';
import { GuildMemberRemoveData, LowercaseEventName } from '../types/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class GuildMemberRemoveHandler extends EventHandler<GuildMemberRemoveData> {
    constructor(bot: Bot) {
        super(basename(__filename, '.js') as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: GuildMemberRemoveData) => {
        this.bot.cache.members.delete(eventData.guild_id, eventData.user.id);
        this.bot.cache.users.set(eventData.user);
    }

    handler = (/*eventData: GuildMemberRemoveData*/) => {
        // TODO: check ban cache to avoid sending these messages for banned members

        // TODO: send to member log if configured
        // TODO: send to mod member log if configured
    }
}