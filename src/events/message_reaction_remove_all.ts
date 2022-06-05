import { EventHandler } from "../data/types";
import { /*ReactionRemoveAllData,*/ LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";
import { basename } from "path";

export default class ReactionRemoveAllHandler extends EventHandler {
    constructor(bot: Bot) {
        const filename = basename(__filename, '.js');
        super(filename as LowercaseEventName, bot);
    }

    handler = () => {} // event unused for now

    /*cacheHandler = (eventData: ReactionRemoveAllData) => {

    }

    handler = (eventData: ReactionRemoveAllData) => {

    }*/
}