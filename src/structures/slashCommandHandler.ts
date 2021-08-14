import Bot from './bot';
import Command from './command';
import * as types from '../data/types';
import * as num from '../data/numberTypes';
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
            const permMessage = LanguageUtils.getAndReplace('GUILD_ONLY', { 
                command: command.name,
                prefix: '/'
            });
            return this.bot.api.interaction.sendResponse(interaction, {
                type: num.INTERACTION_CALLBACK_TYPES.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: permMessage,
                    flags: num.INTERACTION_CALLBACK_FLAGS.EPHEMERAL
                }
            })
        }
        // TODO: complete this
    }
};