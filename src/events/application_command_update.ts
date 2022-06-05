import { EventHandler } from "../data/types";
import { /*CommandUpdateData,*/ LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";
import { basename } from "path";

export default class CommandUpdateHandler extends EventHandler {
    constructor(bot: Bot) {
        const filename = basename(__filename, '.js');
        super(filename as LowercaseEventName, bot);
    }

    handler = () => {} // event unused for now

    /*cacheHandler = (eventData: CommandUpdateData) => {

    }

    handler = (eventData: CommandUpdateData) => {

    }*/
}