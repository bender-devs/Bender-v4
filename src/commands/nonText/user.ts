import type Bot from '../../structures/bot.js';
import { UserCommand } from '../../structures/command.js';
import type { Interaction, InteractionDataOption } from '../../types/types.js';

class UserInfoCommand extends UserCommand {
    constructor(bot: Bot) {
        super(bot, 'User Info', async (interaction: Interaction) => {
            if (!interaction.data?.target_id) {
                return null;
            }
            const infoCommand = this.bot.commandManager.commands.find(cmd => cmd.name === 'info');
            if (!infoCommand?.options) {
                return null;
            }
            const userOption: InteractionDataOption | undefined = infoCommand.options.find(opt => opt.name === 'user');
            if (!userOption?.options?.[0]) {
                return null;
            }
            userOption.options[0].value = interaction.data.target_id;
            interaction.data.options = [userOption];
            return infoCommand.run(interaction);
        })
    }
}

class BannerInfoCommand extends UserCommand {
    constructor(bot: Bot) {
        super(bot, 'Banner Info', async (interaction: Interaction) => {
            if (!interaction.data?.target_id) {
                return null;
            }
            const infoCommand = this.bot.commandManager.commands.find(cmd => cmd.name === 'info');
            if (!infoCommand?.options) {
                return null;
            }
            const userOption: InteractionDataOption | undefined = infoCommand.options.find(opt => opt.name === 'banner');
            if (!userOption?.options?.[0]) {
                return null;
            }
            userOption.options[0].value = interaction.data.target_id;
            interaction.data.options = [userOption];
            return infoCommand.run(interaction);
        })
    }
}

export default function getUserCommands(bot: Bot): UserCommand[] {
    return [
        new UserInfoCommand(bot),
        new BannerInfoCommand(bot)
    ];
}