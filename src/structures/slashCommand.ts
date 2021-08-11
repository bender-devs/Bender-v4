import Bot from './bot';
import Command from './command';
import * as types from './types';
import LanguageUtils from '../utils/language';

export default class SlashCommandHandler {
    bot: Bot;
    
    constructor(bot: Bot) {
        this.bot = bot;
    }

    checkPermissions(command: Command) {
        // TODO: complete this
    }

    runCommand(command: Command, interaction: types.Interaction, args: types.CommandOption[]) {
        return command.run(interaction, args);
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
        // TODO: complete this
    }
};