import { EventHandler } from "../data/types";
import { GuildMemberRemoveData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";

export default class GuildMemberRemoveHandler extends EventHandler {
    constructor(bot: Bot) {
        super(__filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: GuildMemberRemoveData) => {

    }

    handler = (eventData: GuildMemberRemoveData) => {

    }
}