import { EventHandler } from "../data/types";
import { /*TypingStartData,*/ LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";
import { basename } from "path";

export default class TypingStartHandler extends EventHandler {
    constructor(bot: Bot) {
        const filename = basename(__filename, '.js');
        super(filename as LowercaseEventName, bot);
    }

    handler = () => {} // event unused for now

    /*cacheHandler = (eventData: TypingStartData) => {

    }

    handler = (eventData: TypingStartData) => {

    }*/
}