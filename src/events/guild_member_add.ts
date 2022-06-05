import { EventHandler } from "../data/types";
import { GuildMemberAddData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";
import { basename } from "path";

export default class GuildMemberAddHandler extends EventHandler {
    constructor(bot: Bot) {
        const filename = basename(__filename, '.js');
        super(filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: GuildMemberAddData) => {
        this.bot.cache.members.set(eventData.guild_id, eventData);
    }

    handler = (eventData: GuildMemberAddData) => {
        // TODO: send join DM if configured
        // TODO: send to member log if configured
        // TODO: send to mod member log if configured
    }
}