import Bot from './bot';
import Command from './command';


import PingCommand from '../commands/ping';
import DevCommand from '../commands/dev';


export default class SlashCommandManager {
    bot: Bot;
    commands: Command[];
    
    constructor(bot: Bot) {
        this.bot = bot;
        this.commands = [];

        this.commands.push(new PingCommand(this.bot));
        this.commands.push(new DevCommand(this.bot));
    }

    updateCommandList() {
        this.bot.api.command.replaceAll(this.commands);
    }
};