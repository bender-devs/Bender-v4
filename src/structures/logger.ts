import Bot from './bot';
import * as CONSTANTS from '../data/constants';
import * as chalk from 'chalk';

// omitting black because dark mode
const chalkColors = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white', 'gray'] as const;
type ChalkColor = typeof chalkColors[number];


export default class Logger {
    bot?: Bot;
    #moduleColors: Record<string, ChalkColor>;

    constructor(bot?: Bot) {
        this.bot = bot;
        this.#moduleColors = {};
    }

    handleError(moduleName: string | null, error: unknown, ...debugInfo: unknown[]): void {
        this.debug(moduleName || 'ERROR', ...debugInfo);
        console.error(error);
        if (!this.bot) {
            return;
        }
        // TODO: log in error channel
        return;
    }

    log(...args: unknown[]): void {
        const shardMarkup = this.#getShardMarkup();
        if (shardMarkup) {
            return console.log(shardMarkup, ...args);
        }
        console.log(...args);
    }

    moduleLog(moduleName: string, ...args: unknown[]): void {
        const color = this.#getColor(moduleName);
        const moduleMarkup = chalk[color].bold(`[${moduleName}]`);
        const shardMarkup = this.#getShardMarkup();
        console.log(shardMarkup + moduleMarkup, ...args);
    }

    debug(moduleName: string, ...args: unknown[]): void {
        if (!CONSTANTS.DEBUG) {
            return;
        }
        return this.moduleLog(moduleName, ...args);
    }

    #getColor(moduleName: string): ChalkColor {
        if (this.#moduleColors[moduleName]) {
            return this.#moduleColors[moduleName];
        }
        const len = Object.keys(this.#moduleColors).length;
        const colorIndex = len % (chalkColors.length - 1);
        const newColor = chalkColors[colorIndex];
        this.#moduleColors[moduleName] = newColor;
        return newColor;
    }

    #getShardMarkup(): string {
        if (!this.bot?.shard) {
            return '';
        }
        const shardText = `Shard ${this.bot.shard.id}`;
        const shardColor = this.#getColor(shardText);
        return chalk[shardColor].bold(`[${shardText}]`) + ' ';
    }
}