import { UnixTimestamp } from "../data/types";
import Bot from "../structures/bot";

export default class AsyncHandler {
    bot: Bot;

    constructor(bot: Bot) {
        this.bot = bot;
    }

    schedule(timestamp: UnixTimestamp, taskHandler: () => void) {
        // TODO: use node-cron?
    }
}