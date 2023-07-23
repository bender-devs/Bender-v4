import { SlashCommand } from '../structures/command.js';
import Bot from '../structures/bot.js';
import { CommandOption, CommandResponse, Embed, Interaction } from '../types/types.js';
import LangUtils from '../utils/language.js';
import { COMMAND_OPTION_TYPES } from '../types/numberTypes.js';
import TextUtils from '../utils/text.js';
import { DEFAULT_COLOR, WEBSITE } from '../data/constants.js';
import PermissionUtils from '../utils/permissions.js';

export default class HelpCommand extends SlashCommand {
    constructor(bot: Bot) {
        super(bot, LangUtils.get('HELP_NAME'));
    }
    readonly name_localizations = LangUtils.getLocalizationMap('HELP_NAME');

    readonly description = LangUtils.get('HELP_DESCRIPTION');
    readonly description_localizations = LangUtils.getLocalizationMap('HELP_DESCRIPTION');

    readonly dm_permission: boolean = true;

    readonly options: CommandOption[] = [{
        type: COMMAND_OPTION_TYPES.STRING,

        name: LangUtils.get('HELP_OPTION_COMMAND'),
        name_localizations: LangUtils.getLocalizationMap('HELP_OPTION_COMMAND'),
        
        description: LangUtils.get('HELP_OPTION_COMMAND_DESCRIPTION'),
        description_localizations: LangUtils.getLocalizationMap('HELP_OPTION_COMMAND_DESCRIPTION'),

        required: true
    }, {
        type: COMMAND_OPTION_TYPES.BOOLEAN,

        name: LangUtils.get('HELP_OPTION_PERM_ONLY'),
        name_localizations: LangUtils.getLocalizationMap('HELP_OPTION_PERM_ONLY'),
        
        description: LangUtils.get('HELP_OPTION_PERM_ONLY_DESCRIPTION'),
        description_localizations: LangUtils.getLocalizationMap('HELP_OPTION_PERM_ONLY_DESCRIPTION'),
    }]

    async run(interaction: Interaction): CommandResponse {
        const commandName = interaction.data?.options?.find(opt =>
            opt.name === LangUtils.get('HELP_OPTION_COMMAND')
        )?.value;
        if (!commandName || typeof commandName !== 'string') {
            return this.handleUnexpectedError(interaction, 'ARGS_MISSING');
        }
        const command = this.bot.commandManager.findCommand(commandName, interaction);
        if (!command) {
            return this.respondKey(interaction, 'HELP_COMMAND_NOT_FOUND', 'WARNING', true);
        }

        const title = LangUtils.getFromMap(command.name, command.name_localizations, interaction.locale);
        let description = LangUtils.getFromMap(command.description, command.description_localizations, interaction.locale);

        const embed: Embed = {
            title: `/${title}`,
            color: DEFAULT_COLOR,
            fields: []
        }

        const format = LangUtils.getCommandFormat(command.options, interaction.locale);
        const subcommands = LangUtils.getSubcommandList(command.options, interaction.locale);
        if (format) {
            description += `\n${LangUtils.getAndReplace('HELP_FORMAT', {
                format: `\`${commandName} ${format}\``
            }, interaction.locale)}`;
        } else if (subcommands?.length) {
            const cachedCommand = await this.bot.db.command.getByName(command.name);
            const formattedSubcommands = subcommands.map(subcmd => {
                if (cachedCommand?.id) {
                    return TextUtils.mention.parseCommand(`${commandName} ${subcmd}`, cachedCommand.id);
                }
                return `\`/${commandName} ${subcmd}\``;
            })
            embed.fields?.push({
                name: LangUtils.get('HELP_SUBCOMMANDS_TITLE', interaction.locale),
                value: formattedSubcommands.join(' ')
            });
        }

        if (command.default_member_permissions) {
            const perms = PermissionUtils.getPermNamesFromBitfield(command.default_member_permissions);
            const defaultPerms = LangUtils.getAndReplace('HELP_DEFAULT_PERMS', {
                perms: perms.map(perm => `\`${perm}\``).join(', ')
            });
            description += `\n${defaultPerms}`;
        }

        const moreInfo = LangUtils.get('HELP_COMMAND_LINK', interaction.locale);
        description += `\n\n[${moreInfo}](${WEBSITE}/commands#${command.name})`;

        embed.description = description;

        return this.respond(interaction, { embeds: [embed] }, undefined, true);
    }
}
