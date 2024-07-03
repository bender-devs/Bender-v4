import type Bot from '../structures/bot.js';
import MemberLogUtils from './memberLog.js';
import MinAgeUtils from './minage.js';

export default class EventUtils {
    bot: Bot;
    memberLog: MemberLogUtils;
    minAge: MinAgeUtils;

    constructor(bot: Bot) {
        this.bot = bot;
        this.memberLog = new MemberLogUtils(bot);
        this.minAge = new MinAgeUtils(bot);
    }
}
