import { UnixTimestampMillis } from "../data/types";
import Bot from "../structures/bot";

export default class AsyncHandler {
    bot: Bot;

    constructor(bot: Bot) {
        this.bot = bot;
    }

    schedule(timestamp: UnixTimestampMillis, taskHandler: () => void) {
        // TODO: use node-cron?
    }
}