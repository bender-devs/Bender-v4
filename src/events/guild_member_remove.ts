import { EventHandler } from "../data/types";
import { GuildMemberRemoveData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";
import { basename } from "path";

export default class GuildMemberRemoveHandler extends EventHandler {
    constructor(bot: Bot) {
        const filename = basename(__filename, '.js');
        super(filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: GuildMemberRemoveData) => {
        this.bot.cache.members.delete(eventData.guild_id, eventData.user.id);
    }

    handler = (eventData: GuildMemberRemoveData) => {
        // TODO: send to member log if configured
        // TODO: send to mod member log if configured
    }
}