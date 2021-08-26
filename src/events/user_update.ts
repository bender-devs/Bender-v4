import { EventHandler } from "../data/types";
import { UserUpdateData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";

export default class UserUpdateHandler extends EventHandler {
    constructor(bot: Bot) {
        super(__filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: UserUpdateData) => {

    }

    handler = (eventData: UserUpdateData) => {

    }
}