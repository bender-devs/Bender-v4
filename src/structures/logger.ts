import Bot from "./bot";
import * as CONSTANTS from '../data/constants'

export default class Logger {
    bot: Bot;

    constructor(bot: Bot) {
        this.bot = bot;
    }

    handleError(error: Error, returnValue: any, debugInfo?: any) {
        console.error(error);
        // TODO: log in error channel
        if (debugInfo) {
            this.debug(`[${error.name}]`, debugInfo);
        }
        return returnValue;
    }

    debug(...args: any) {
        if (CONSTANTS.DEBUG) {
            console.log(...args);
        }
    }
}