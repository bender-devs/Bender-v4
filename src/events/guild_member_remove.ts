import { EventHandler } from "../data/types";
import { GuildMemberRemoveData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";

export default class GuildMemberRemoveHandler extends EventHandler {
    constructor(bot: Bot) {
        super(__filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: GuildMemberRemoveData) => {
        this.bot.cache.members.delete(eventData.guild_id, eventData.user.id);
    }

    handler = (eventData: GuildMemberRemoveData) => {

    }
}