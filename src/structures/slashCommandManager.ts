import Bot from './bot';
import Command from './command';


import PingCommand from '../commands/ping';


export default class SlashCommandManager {
    bot: Bot;
    commands: Command[];
    
    constructor(bot: Bot) {
        this.bot = bot;
        this.commands = [];

        this.commands.push(new PingCommand(this.bot));
    }

    updateCommandList() {
        this.bot.api.command.replaceAll(this.commands);
    }
};