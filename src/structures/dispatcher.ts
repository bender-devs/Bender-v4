import Bot from "./bot";

export default class Dispatcher {
    bot: Bot;

    constructor(bot: Bot) {
        this.bot = bot;
    }

    dispatch() {}

    handleRateLimit() {}
}