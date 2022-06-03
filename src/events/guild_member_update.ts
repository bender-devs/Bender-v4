import { EventHandler } from "../data/types";
import { GuildMemberUpdateData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";
import { basename } from "path";

export default class GuildMemberUpdateHandler extends EventHandler {
    constructor(bot: Bot) {
        const filename = basename(__filename, '.js');
        super(filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: GuildMemberUpdateData) => {
        this.bot.cache.members.update(eventData);
    }

    handler = (eventData: GuildMemberUpdateData) => {

    }
}