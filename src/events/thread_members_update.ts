import { EventHandler } from "../data/types";
import { /*ThreadMembersUpdateData,*/ LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";
import { basename } from "path";

export default class ThreadMembersUpdateHandler extends EventHandler {
    constructor(bot: Bot) {
        const filename = basename(__filename, '.js');
        super(filename as LowercaseEventName, bot);
    }

    handler = () => {} // event unused for now

    /*cacheHandler = (eventData: ThreadMembersUpdateData) => {

    }

    handler = (eventData: ThreadMembersUpdateData) => {

    }*/
}