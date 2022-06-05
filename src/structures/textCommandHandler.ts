import Bot from './bot';
import { ICommand } from './command';
import * as types from '../data/types';

export default class TextCommandHandler {
    bot: Bot;

    constructor (bot: Bot) {
        this.bot = bot;
    }

    parseCommand(input: string) {
        // TODO: finish this
    }
    checkPermissions(command: ICommand, message: types.Message) {
        // TODO: finish this
    }
    handleEdit(command: ICommand, message: types.Message, oldMessage: types.Message) {
        // TODO: finish this
    }
    runCommand(command: ICommand, argString: string) {
        // TODO: finish this
    }
}

module.exports = TextCommandHandler;