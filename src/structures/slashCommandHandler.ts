import Bot from './bot';
import { ICommand } from './command';
import * as types from '../data/types';

export default class SlashCommandHandler {
    bot: Bot;
    
    constructor(bot: Bot) {
        this.bot = bot;
    }

    runCommand(command: ICommand, interaction: types.Interaction) {
        return command.run(interaction);
    }

    handleCommand(interaction: types.Interaction, command: ICommand) {
        // TODO: complete this
        return this.runCommand(command, interaction);
    }
}