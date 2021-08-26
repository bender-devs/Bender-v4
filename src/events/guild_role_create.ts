import { EventHandler } from "../data/types";
import { GuildRoleUpdateData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";

export default class GuildRoleCreateHandler extends EventHandler {
    constructor(bot: Bot) {
        super(__filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: GuildRoleUpdateData) => {

    }

    handler = (eventData: GuildRoleUpdateData) => {

    }
}