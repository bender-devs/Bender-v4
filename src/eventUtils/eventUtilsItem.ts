import type Bot from '../structures/bot.js';
import type { GuildDotFormatKey } from '../types/dbTypes.js';

export default class EventUtilsItem {
    bot: Bot;
    static SETTINGS?: Record<string, GuildDotFormatKey[]>;

    constructor(bot: Bot) {
        this.bot = bot;
    }
}
