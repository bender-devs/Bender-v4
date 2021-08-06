import Bot from '../structures/bot';
import Command from '../structures/command';
import * as types from '../structures/types';
import LanguageUtils from './language';

export default class SlashCommandHandler {
    bot: Bot;
    
    constructor(bot: Bot) {
        this.bot = bot;
    }

    checkPermissions(command: Command) {

    }

    runCommand(command: Command, args: types.CommandOption[]) {

    }

    handleCommand(interaction: types.Interaction, command: Command) {
        if (!interaction.guild_id && command.guildOnly) {
            const permMessage = LanguageUtils.getAndReplace('GUILD_ONLY', { command: command.name });
            return this.bot.api.sendInteractionResponse(interaction, {
                type: 4,
                data: {
                    content: permMessage,
                    flags: 64
                }
            })
        }
    }
};