import Bot from "./bot";
import * as CONSTANTS from '../data/constants';
import * as chalk from 'chalk';

// omitting black because dark mode
const chalkColors = ["red", "green", "yellow", "blue", "magenta", "cyan", "white", "gray"] as const;
type ChalkColor = typeof chalkColors[number];


export default class Logger {
    bot: Bot;
    #moduleColors: Record<string, ChalkColor>;

    constructor(bot: Bot) {
        this.bot = bot;
        this.#moduleColors = {};
    }

    handleError(error: Error, returnValue: any, ...debugInfo: any) {
        this.debug(error.name, ...debugInfo);
        console.error(error);
        // TODO: log in error channel
        return returnValue;
    }

    log(...args: any) {
        console.log(...args);
    }

    debug(moduleName: string, ...args: any) {
        if (!CONSTANTS.DEBUG) return;
        let color = this.#moduleColors[moduleName] || null;
        if (!color) {
            const len = Object.keys(this.#moduleColors).length;
            const colorIndex = len === 0 ? 0 : (len % chalkColors.length + 1);
            color = chalkColors[colorIndex];
            this.#moduleColors[moduleName] = color;
        }
        console.log(chalk[color].bold(`[${moduleName}]`), ...args);
    }
}