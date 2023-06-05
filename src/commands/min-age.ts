import { ICommand, CommandUtils } from '../structures/command.js';
import Bot from '../structures/bot.js';
import { Bitfield, CommandOption, CommandResponse, Interaction } from '../types/types.js';
import LangUtils from '../utils/language.js';
import { COMMAND_OPTION_TYPES, PERMISSIONS } from '../types/numberTypes.js';
import TimeUtils from '../utils/time.js';

export default class MinAgeCommand extends CommandUtils implements ICommand {
    constructor(bot: Bot) {
        super(bot, LangUtils.get('MINAGE_NAME'));
    }
    readonly name_localizations = LangUtils.getLocalizationMap('MINAGE_NAME');

    readonly description = LangUtils.get('MINAGE_DESCRIPTION');
    readonly description_localizations = LangUtils.getLocalizationMap('MINAGE_DESCRIPTION');

    readonly default_member_permissions = `${PERMISSIONS.KICK_MEMBERS}` as Bitfield;
    readonly dm_permission = false;

    readonly options: CommandOption[] = [{
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,

        name: LangUtils.get('MINAGE_SUBCOMMAND_VIEW'),
        name_localizations: LangUtils.getLocalizationMap('MINAGE_SUBCOMMAND_VIEW'),
        
        description: LangUtils.get('MINAGE_SUBCOMMAND_VIEW_DESCRIPTION'),
        description_localizations: LangUtils.getLocalizationMap('MINAGE_SUBCOMMAND_VIEW_DESCRIPTION')
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,

        name: LangUtils.get('MINAGE_SUBCOMMAND_SET'),
        name_localizations: LangUtils.getLocalizationMap('MINAGE_SUBCOMMAND_SET'),
        
        description: LangUtils.get('MINAGE_SUBCOMMAND_SET_DESCRIPTION'),
        description_localizations: LangUtils.getLocalizationMap('MINAGE_SUBCOMMAND_SET_DESCRIPTION'),

        options: [{
            name: LangUtils.get('MINAGE_OPTION'),
            name_localizations: LangUtils.getLocalizationMap('MINAGE_OPTION'),

            description: LangUtils.get('MINAGE_OPTION_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('MINAGE_OPTION_DESCRIPTION'),

            type: COMMAND_OPTION_TYPES.STRING
        }]
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,

        name: LangUtils.get('MINAGE_SUBCOMMAND_ENABLE'),
        name_localizations: LangUtils.getLocalizationMap('MINAGE_SUBCOMMAND_ENABLE'),
        
        description: LangUtils.get('MINAGE_SUBCOMMAND_ENABLE_DESCRIPTION'),
        description_localizations: LangUtils.getLocalizationMap('MINAGE_SUBCOMMAND_ENABLE_DESCRIPTION')
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,

        name: LangUtils.get('MINAGE_SUBCOMMAND_DISABLE'),
        name_localizations: LangUtils.getLocalizationMap('MINAGE_SUBCOMMAND_DISABLE'),
        
        description: LangUtils.get('MINAGE_SUBCOMMAND_DISABLE_DESCRIPTION'),
        description_localizations: LangUtils.getLocalizationMap('MINAGE_SUBCOMMAND_DISABLE_DESCRIPTION')
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,

        name: LangUtils.get('MINAGE_SUBCOMMAND_ACTION'),
        name_localizations: LangUtils.getLocalizationMap('MINAGE_SUBCOMMAND_ACTION'),
        
        description: LangUtils.get('MINAGE_SUBCOMMAND_ACTION_DESCRIPTION'),
        description_localizations: LangUtils.getLocalizationMap('MINAGE_SUBCOMMAND_ACTION_DESCRIPTION'),

        options: [{
            name: LangUtils.get('MINAGE_OPTION_ACTION'),
            name_localizations: LangUtils.getLocalizationMap('MINAGE_OPTION_ACTION'),

            description: LangUtils.get('MINAGE_OPTION_ACTION_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('MINAGE_OPTION_ACTION_DESCRIPTION'),

            type: COMMAND_OPTION_TYPES.STRING,
            choices: [{
                name: LangUtils.get('MINAGE_OPTION_ACTION_KICK'),
                name_localizations: LangUtils.getLocalizationMap('MINAGE_OPTION_ACTION_KICK'),
                value: 'kick'
            }, {
                name: LangUtils.get('MINAGE_OPTION_ACTION_BAN'),
                name_localizations: LangUtils.getLocalizationMap('MINAGE_OPTION_ACTION_BAN'),
                value: 'ban'
            }]
        }]
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,

        name: LangUtils.get('MINAGE_SUBCOMMAND_MESSAGE'),
        name_localizations: LangUtils.getLocalizationMap('MINAGE_SUBCOMMAND_MESSAGE'),
        
        description: LangUtils.get('MINAGE_SUBCOMMAND_MESSAGE_DESCRIPTION'),
        description_localizations: LangUtils.getLocalizationMap('MINAGE_SUBCOMMAND_MESSAGE_DESCRIPTION'),

        options: [{
            name: LangUtils.get('MINAGE_OPTION_MESSAGE'),
            name_localizations: LangUtils.getLocalizationMap('MINAGE_OPTION_MESSAGE'),

            description: LangUtils.get('MINAGE_OPTION_MESSAGE_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('MINAGE_OPTION_MESSAGE_DESCRIPTION'),

            type: COMMAND_OPTION_TYPES.STRING
        }]
    }]

    async run(interaction: Interaction): CommandResponse {
        const authorID = interaction.member?.user.id || interaction.user?.id;
        if (!authorID) {
            return this.handleUnexpectedError(interaction, 'AUTHOR_UNKNOWN');
        }
        if (!interaction.guild_id) {
            return this.respondKeyReplace(interaction, 'GUILD_ONLY', { prefix: '/', command: this.name }, 'GUILD', true);
        }

        const current = await this.bot.db.guild.get(interaction.guild_id, { minage: 1 });
        const min = current?.minage;

        const args = interaction.data?.options;
        const subcommand = args?.[0]?.name;
        switch (subcommand) {
            case LangUtils.get('MINAGE_SUBCOMMAND_VIEW'): {
                const title = LangUtils.get('MINAGE_TITLE', interaction.locale);
                const status = LangUtils.get(`MINAGE_${min?.enabled ? 'EN' : 'DIS'}ABLED`, interaction.locale);
                let duration = LangUtils.get('MINAGE_DURATION_NONE', interaction.locale);
                if (min?.duration) {
                    duration = LangUtils.getAndReplace('MINAGE_DURATION', {
                        duration: TimeUtils.formatDuration(min.duration) 
                    }, interaction.locale);
                }
                const action = LangUtils.getAndReplace('MINAGE_ACTION', {
                    action: min?.action || 'kick'
                }, interaction.locale);
                const exampleDuration = LangUtils.get('MINAGE_EXAMPLE_DURATION', interaction.locale);
                const defaultMessage = LangUtils.getAndReplace('MINAGE_DEFAULT_MESSAGE', {
                    duration: min?.duration ? duration : `\`${exampleDuration}\``,
                    timestamp: '<t:3133702800>'
                }, interaction.locale);
                const message = LangUtils.getAndReplace('MINAGE_MESSAGE', {
                    message: min?.message || defaultMessage
                }, interaction.locale);
                const replyText = [title, status, action, message].join('\n');
                return this.respond(interaction, replyText, 'INFO');
            }
            default:
                return this.handleUnexpectedError(interaction, 'INVALID_SUBCOMMAND');
        }
    }
}
