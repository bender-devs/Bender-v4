import { EventHandler } from "../data/types";
import { GuildRoleDeleteData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";

export default class GuildRoleDeleteHandler extends EventHandler {
    constructor(bot: Bot) {
        super(__filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: GuildRoleDeleteData) => {
        this.bot.cache.roles.delete(eventData.guild_id, eventData.role_id);
    }

    handler = (eventData: GuildRoleDeleteData) => {

    }
}