import Bot from './bot';
import Command from './command';
import * as types from '../data/types';

export default class TextCommandHandler {
    bot: Bot;

    constructor (bot: Bot) {
        this.bot = bot;
    }

    parseCommand(input: string) {
        // TODO: finish this
    }
    checkPermissions(command: Command, message: types.Message) {
        // TODO: finish this
    }
    handleEdit(command: Command, message: types.Message, oldMessage: types.Message) {
        // TODO: finish this
    }
    runCommand(command: Command, argString: string) {
        // TODO: finish this
    }
}

module.exports = TextCommandHandler;