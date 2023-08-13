//import { UnixTimestampMillis } from '../data/types';
import type Bot from './bot.js';

export default class AsyncHandler {
    bot: Bot;

    constructor(bot: Bot) {
        this.bot = bot;
    }

    schedule(/*timestamp: UnixTimestampMillis, taskHandler: () => undefined*/) {
        // TODO: use node-cron?
    }
}