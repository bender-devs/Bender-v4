import { EventHandler } from '../types/types';
import { GuildMemberUpdateData, LowercaseEventName } from '../types/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class GuildMemberUpdateHandler extends EventHandler<GuildMemberUpdateData> {
    constructor(bot: Bot) {
        super(basename(__filename, '.js') as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: GuildMemberUpdateData) => {
        const oldMember = this.bot.cache.members.get(eventData.guild_id, eventData.user.id);
        this.bot.cache.members.update(eventData);
        if (!oldMember) {
            return;
        }

        if (oldMember.nick !== eventData.nick) {
            // TODO: if namefilter is enabled, check it
            // TODO: if member update logging is enabled, do that
        }

        // TODO: add to nickname history in db

        // TODO: if member is the bot user, check if essential permissions have been removed
    }

    // only using cacheHandler as we wouldn't know what fields changed here
    handler = () => undefined
}