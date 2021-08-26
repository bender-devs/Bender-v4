import { EventHandler } from "../data/types";
import { GuildMemberUpdateData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";

export default class GuildMemberUpdateHandler extends EventHandler {
    constructor(bot: Bot) {
        super(__filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: GuildMemberUpdateData) => {

    }

    handler = (eventData: GuildMemberUpdateData) => {

    }
}