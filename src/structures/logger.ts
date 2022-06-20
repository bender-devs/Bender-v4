import Bot from './bot';
import { DEBUG } from '../data/constants';
import * as chalk from 'chalk';
import { createHash } from 'crypto';

export default class Logger {
    bot?: Bot;
    #moduleColors: Record<string, string>;

    constructor(bot?: Bot) {
        this.bot = bot;
        this.#moduleColors = {};
    }

    handleError(moduleName: string | null, error: unknown, ...debugInfo: unknown[]): void {
        const color = this.#getColor(moduleName || 'ERROR');
        const moduleMarkup = chalk.hex(color).bold(`[${moduleName}]`);
        const shardMarkup = this.#getShardMarkup();
        console.error(shardMarkup + moduleMarkup, error, ...debugInfo);

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
        const moduleMarkup = chalk.hex(color).bold(`[${moduleName}]`);
        const shardMarkup = this.#getShardMarkup();
        console.log(shardMarkup + moduleMarkup, ...args);
    }

    warn(...args: unknown[]): void {
        const shardMarkup = this.#getShardMarkup();
        if (shardMarkup) {
            return console.warn(shardMarkup, ...args);
        }
        console.warn(...args);
    }

    moduleWarn(moduleName: string, ...args: unknown[]): void {
        const color = this.#getColor(moduleName);
        const moduleMarkup = chalk.hex(color).bold(`[${moduleName}]`);
        const shardMarkup = this.#getShardMarkup();
        console.warn(shardMarkup + moduleMarkup, ...args);
    }

    debug(moduleName: string, ...args: unknown[]): void {
        if (!DEBUG) {
            return;
        }
        return this.moduleLog(moduleName, ...args);
    }

    #getColor(moduleName: string): string {
        if (this.#moduleColors[moduleName]) {
            return this.#moduleColors[moduleName];
        }
        const newColor = Logger.getHashHexColor(moduleName);
        this.#moduleColors[moduleName] = newColor;
        return newColor;
    }

    #getShardMarkup(): string {
        if (!this.bot?.shard) {
            return '';
        }
        const shardText = `Shard ${this.bot.shard.id}`;
        const shardColor = this.#getColor(shardText);
        return `${chalk.hex(shardColor).bold(`[${shardText}]`)} `;
    }

    static getHashHexColor(moduleName: string): string {
        const hash = createHash('sha256').update(moduleName).digest('hex');
        let red = parseInt(hash.substring(0, 2), 16);
        let green = parseInt(hash.substring(2, 4), 16);
        let blue = parseInt(hash.substring(4, 6), 16);
        if (red + green + blue < 150) {
            red += 50;
            green += 50;
            blue += 50;
        }
        return `${this.#toHexByte(red)}${this.#toHexByte(green)}${this.#toHexByte(blue)}`;
    }

    static #toHexByte = (num: number) => num.toString(16).padStart(2, '0')
}