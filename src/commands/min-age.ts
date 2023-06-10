import { ICommand, CommandUtils } from '../structures/command.js';
import Bot from '../structures/bot.js';
import { Bitfield, CommandOption, CommandResponse, Interaction, Locale } from '../types/types.js';
import LangUtils from '../utils/language.js';
import { COMMAND_OPTION_TYPES, PERMISSIONS } from '../types/numberTypes.js';
import TimeUtils from '../utils/time.js';
import { MINAGE_MESSAGE_LENGTH } from '../data/dbLimits.js';
import { MinAgeAction, MINAGE_ACTIONS } from '../types/dbTypes.js';
import Replacers from '../utils/replacers.js';
import { EXAMPLE_TIMESTAMP } from '../data/constants.js';

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
            type: COMMAND_OPTION_TYPES.STRING,

            name: LangUtils.get('MINAGE_OPTION'),
            name_localizations: LangUtils.getLocalizationMap('MINAGE_OPTION'),

            description: LangUtils.get('MINAGE_OPTION_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('MINAGE_OPTION_DESCRIPTION'),

            required: true,
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
            type: COMMAND_OPTION_TYPES.STRING,

            name: LangUtils.get('MINAGE_OPTION_ACTION'),
            name_localizations: LangUtils.getLocalizationMap('MINAGE_OPTION_ACTION'),

            description: LangUtils.get('MINAGE_OPTION_ACTION_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('MINAGE_OPTION_ACTION_DESCRIPTION'),

            required: true,
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
            type: COMMAND_OPTION_TYPES.STRING,

            name: LangUtils.get('MINAGE_OPTION_MESSAGE'),
            name_localizations: LangUtils.getLocalizationMap('MINAGE_OPTION_MESSAGE'),

            description: LangUtils.get('MINAGE_OPTION_MESSAGE_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('MINAGE_OPTION_MESSAGE_DESCRIPTION'),

            required: true
        }]
    }]

    hideSubcommands = true;

    async getDetails(locale?: Locale) {
        const cmdSet = await this.getLink(['MINAGE_NAME', 'MINAGE_SUBCOMMAND_SET'], locale);
        const cmdAction = await this.getLink(['MINAGE_NAME', 'MINAGE_SUBCOMMAND_ACTION'], locale);
        const cmdMessage = await this.getLink(['MINAGE_NAME', 'MINAGE_SUBCOMMAND_MESSAGE'], locale);
        const cmdEnable = await this.getLink(['MINAGE_NAME', 'MINAGE_SUBCOMMAND_ENABLE'], locale);
        const cmdDisable = await this.getLink(['MINAGE_NAME', 'MINAGE_SUBCOMMAND_DISABLE'], locale);
        let details = LangUtils.getAndReplace('MINAGE_DETAILS', {
            cmdSet, cmdAction, cmdMessage, cmdEnable, cmdDisable
        }, locale);
        details += `\n\n${LangUtils.getAndReplace('MINAGE_VARIABLES', { cmdMessage }, locale)}`;
        details += `\n${LangUtils.getAndReplace('MINAGE_VARIABLE_DURATION', {
            exampleDuration: LangUtils.get('MINAGE_EXAMPLE_DURATION', locale)
        }, locale)}`;
        details += `\n${LangUtils.getAndReplace('MINAGE_VARIABLE_TIMESTAMP', {
            exampleTimestamp: TimeUtils.formatDate(EXAMPLE_TIMESTAMP)
        }, locale)}`;
        details += `\n${LangUtils.getAndReplace('MINAGE_VARIABLE_RELATIVE', {
            exampleRelative: TimeUtils.relative(EXAMPLE_TIMESTAMP)
        }, locale)}`;
        return details;
    }

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
                const actionUpper = (min?.action || 'kick').toUpperCase() as Uppercase<MinAgeAction>;
                const actionLocalized = LangUtils.get(`MINAGE_OPTION_ACTION_${actionUpper}`, interaction.locale);
                const action = LangUtils.getAndReplace('MINAGE_ACTION', {
                    action: actionLocalized
                }, interaction.locale);
                const message = LangUtils.getAndReplace('MINAGE_MESSAGE', {
                    message: Replacers.minage(min?.duration, min?.message, interaction.locale)
                }, interaction.locale);
                const replyText = [title, status, duration, action, message].join('\n');
                return this.respond(interaction, replyText, 'INFO');
            }
            case LangUtils.get('MINAGE_SUBCOMMAND_SET'): {
                const durationText = interaction.data?.options?.[0]?.options?.[0].value;
                if (!durationText || typeof durationText !== 'string') {
                    return this.handleUnexpectedError(interaction, 'ARGS_INVALID_TYPE');
                }
                
                // TODO: parse duration
                const duration = 0;

                return this.bot.db.guild.update(interaction.guild_id, 'minage.duration', duration).then(result => {
                    const replyText = LangUtils.get(`MINAGE_DURATION_SET${result.changes ? '' : '_ALREADY'}`, interaction.locale);
                    return this.respond(interaction, replyText, `SUCCESS${result.changes ? '' : '_ALT'}`);
                }).catch(err => {
                    this.bot.logger.handleError('/min-age set', err);
                    return this.respondKey(interaction, 'MINAGE_DURATION_SET_FAILED', 'ERROR');
                });
            }
            case LangUtils.get('MINAGE_SUBCOMMAND_ENABLE'): {
                if (!min?.duration) {
                    const cmdLink = await this.getLink(['MINAGE_NAME', 'MINAGE_SUBCOMMAND_SET'], interaction.locale);
                    return this.respondKeyReplace(interaction, 'MINAGE_ENABLED_SET_INVALID', { commandLink: cmdLink }, 'WARNING', true);
                }
                return this.bot.db.guild.update(interaction.guild_id, 'minage.enabled', true).then(result => {
                    const replyText = LangUtils.get(`MINAGE_ENABLED_SET${result.changes ? '' : '_ALREADY'}`, interaction.locale);
                    return this.respond(interaction, replyText, `SUCCESS${result.changes ? '' : '_ALT'}`);
                }).catch(err => {
                    this.bot.logger.handleError('/min-age enable', err);
                    return this.respondKey(interaction, 'MINAGE_ENABLED_SET_FAILED', 'ERROR');
                });
            }
            case LangUtils.get('MINAGE_SUBCOMMAND_DISABLE'): {
                return this.bot.db.guild.update(interaction.guild_id, 'minage.enabled', false).then(result => {
                    const replyText = LangUtils.get(`MINAGE_DISABLED_SET${result.changes ? '' : '_ALREADY'}`, interaction.locale);
                    return this.respond(interaction, replyText, `SUCCESS${result.changes ? '' : '_ALT'}`);
                }).catch(err => {
                    this.bot.logger.handleError('/min-age disable', err);
                    return this.respondKey(interaction, 'MINAGE_DISABLED_SET_FAILED', 'ERROR');
                });
            }
            case LangUtils.get('MINAGE_SUBCOMMAND_ACTION'): {
                const action = interaction.data?.options?.[0]?.options?.[0].value;
                if (!action || typeof action !== 'string' || !MINAGE_ACTIONS.includes(action as MinAgeAction)) {
                    return this.handleUnexpectedError(interaction, 'ARGS_INVALID_TYPE');
                }
                const actionUpper = action.toUpperCase() as Uppercase<MinAgeAction>;
                const actionLocalized = LangUtils.get(`MINAGE_OPTION_ACTION_${actionUpper}`, interaction.locale);

                return this.bot.db.guild.update(interaction.guild_id, 'minage.action', action).then(result => {
                    const replyText = LangUtils.getAndReplace(`MINAGE_ACTION_SET${result.changes ? '' : '_ALREADY'}`, {
                        action: actionLocalized
                    }, interaction.locale);
                    return this.respond(interaction, replyText, `SUCCESS${result.changes ? '' : '_ALT'}`);
                }).catch(err => {
                    this.bot.logger.handleError('/min-age action', err);
                    return this.respondKey(interaction, 'MINAGE_ACTION_SET_FAILED', 'ERROR');
                });
            }
            case LangUtils.get('MINAGE_SUBCOMMAND_MESSAGE'): {
                const message = interaction.data?.options?.[0]?.options?.[0].value;
                if (!message || typeof message !== 'string') {
                    return this.handleUnexpectedError(interaction, 'ARGS_INVALID_TYPE');
                }

                if (message.length > MINAGE_MESSAGE_LENGTH) {
                    return this.respondKeyReplace(interaction, 'MESSAGE_TOO_LONG', {
                        chars: MINAGE_MESSAGE_LENGTH
                    }, 'WARNING');
                }

                return this.bot.db.guild.update(interaction.guild_id, 'minage.message', message).then(result => {
                    const replyText = LangUtils.get(`MINAGE_MESSAGE_SET${result.changes ? '' : '_ALREADY'}`, interaction.locale);
                    return this.respond(interaction, replyText, `SUCCESS${result.changes ? '' : '_ALT'}`);
                }).catch(err => {
                    this.bot.logger.handleError('/min-age message', err);
                    return this.respondKey(interaction, 'MINAGE_MESSAGE_SET_FAILED', 'ERROR');
                });
            }
            default:
                return this.handleUnexpectedError(interaction, 'INVALID_SUBCOMMAND');
        }
    }
}
