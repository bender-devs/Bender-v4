import { EventHandler } from "../data/types";
import { /*InviteDeleteData,*/ LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";
import { basename } from "path";

export default class InviteDeleteHandler extends EventHandler {
    constructor(bot: Bot) {
        const filename = basename(__filename, '.js');
        super(filename as LowercaseEventName, bot);
    }

    handler = () => {} // event unused for now

    /*cacheHandler = (eventData: InviteDeleteData) => {

    }

    handler = (eventData: InviteDeleteData) => {

    }*/
}