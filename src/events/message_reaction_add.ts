import { EventHandler } from "../data/types";
import { ReactionAddData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";
import { basename } from "path";

export default class ReactionAddHandler extends EventHandler {
    constructor(bot: Bot) {
        const filename = basename(__filename, '.js');
        super(filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: ReactionAddData) => {

    }

    handler = (eventData: ReactionAddData) => {
        // TODO: code for role menus & giveaways (if those aren't replaced with interactions)
    }
}