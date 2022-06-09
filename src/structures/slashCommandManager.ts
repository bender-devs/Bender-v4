import Bot from './bot';
import { ICommand } from './command';
import { DEV_SERVER } from '../data/constants';

import PingCommand from '../commands/ping';
import TextCommand from '../commands/text';

import DevCommand from '../commands/dev';


export default class SlashCommandManager {
    bot: Bot;
    commands: ICommand[];
    developer_commands: ICommand[];
    
    constructor(bot: Bot) {
        this.bot = bot;

        this.commands = [];
        this.commands.push(new PingCommand(this.bot));
        this.commands.push(new TextCommand(this.bot));
        
        this.developer_commands = [];
        this.developer_commands.push(new DevCommand(this.bot));
    }

    updateCommandList() {
        // TODO: use db to determine what commands need updating so that permissions aren't reset every time
        this.bot.api.command.replaceAll(this.commands);
        this.bot.api.guildCommand.replaceAll(DEV_SERVER, this.developer_commands);
    }
}