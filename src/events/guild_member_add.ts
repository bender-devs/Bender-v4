import { EventHandler } from "../data/types";
import { GuildMemberAddData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";

export default class GuildMemberAddHandler extends EventHandler {
    constructor(bot: Bot) {
        super(__filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: GuildMemberAddData) => {

    }

    handler = (eventData: GuildMemberAddData) => {

    }
}