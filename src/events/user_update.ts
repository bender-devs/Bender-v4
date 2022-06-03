import { EventHandler } from "../data/types";
import { UserUpdateData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";
import { basename } from "path";

export default class UserUpdateHandler extends EventHandler {
    constructor(bot: Bot) {
        const filename = basename(__filename, '.js');
        super(filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: UserUpdateData) => {
        this.bot.cache.users.set(eventData.id, eventData);
    }

    handler = (eventData: UserUpdateData) => {

    }
}