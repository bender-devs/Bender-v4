import { EventHandler } from "../data/types";
import { InviteCreateData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";
import { basename } from "path";

export default class InviteCreateHandler extends EventHandler {
    constructor(bot: Bot) {
        const filename = basename(__filename, '.js');
        super(filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: InviteCreateData) => {

    }

    handler = (eventData: InviteCreateData) => {

    }
}