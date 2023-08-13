import { EventHandler } from '../types/types.js';
import type { GuildMemberAddData } from '../types/gatewayTypes.js';
import type Bot from '../structures/bot.js';

export default class GuildMemberAddHandler extends EventHandler<GuildMemberAddData> {
    constructor(bot: Bot) {
        super('guild_member_add', bot);
    }

    cacheHandler = (eventData: GuildMemberAddData) => {
        this.bot.cache.members.set(eventData.guild_id, eventData);
        this.bot.cache.users.set(eventData.user);
    }

    handler = (/*eventData: GuildMemberAddData*/) => {
        // TODO: apply namefilter if applicable
        // TODO: apply minage if applicable
        // TODO: re-mute if applicable
        // TODO: send join DM if configured
        // TODO: send to member log if configured
        // TODO: send to mod member log if configured
        // TODO: add autorole if configured and member isn't "pending"
        // TODO: re-add temproles if applicable
        // TODO: add username to guild nickname history

        // TODO: deal with agreement, if that feature isn't replaced by member screening
    }
}