import type Bot from '../structures/bot.js';
import type { GuildDotFormatKey } from '../types/dbTypes.js';
import MemberLogUtils from './memberLog.js';

export default class EventUtils {
    bot: Bot;
    memberLog: MemberLogUtils;

    constructor(bot: Bot) {
        this.bot = bot;
        this.memberLog = new MemberLogUtils(bot);
    }
}

export class EventUtilsItem {
    bot: Bot;
    static SETTINGS?: Record<string, GuildDotFormatKey[]>;

    constructor(bot: Bot) {
        this.bot = bot;
    }
}
