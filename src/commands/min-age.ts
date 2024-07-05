import { EXAMPLE_DURATION, EXAMPLE_TIMESTAMP } from '../data/constants.js';
import {
    MINAGE_DURATION_MAXIMUM,
    MINAGE_DURATION_MINIMUM,
    MINAGE_MESSAGE_LENGTH_MAXIMUM,
} from '../data/dbLimits.js';
import type Bot from '../structures/bot.js';
import { SlashCommand } from '../structures/command.js';
import type { MinAgeAction } from '../types/dbTypes.js';
import { MINAGE_ACTIONS } from '../types/dbTypes.js';
import { COMMAND_OPTION_TYPES, PERMISSIONS } from '../types/numberTypes.js';
import type { Bitfield, CommandOption, CommandResponse, Interaction, Locale } from '../types/types.js';
import LangUtils from '../utils/language.js';
import Replacers from '../utils/replacers.js';
import TimeUtils from '../utils/time.js';

export default class MinAgeCommand extends SlashCommand {
    constructor(bot: Bot) {
        super(bot, LangUtils.get('MINAGE_NAME'));
    }
    readonly name_localizations = LangUtils.getLocalizationMap('MINAGE_NAME');

    readonly description = LangUtils.get('MINAGE_DESCRIPTION');
    readonly description_localizations = LangUtils.getLocalizationMap('MINAGE_DESCRIPTION');

    readonly default_member_permissions = `${PERMISSIONS.KICK_MEMBERS}` satisfies Bitfield;
    readonly dm_permission: boolean = false;

    readonly options: CommandOption[] = [
        {
            type: COMMAND_OPTION_TYPES.SUB_COMMAND,

            name: LangUtils.get('MINAGE_SUBCOMMAND_VIEW'),
            name_localizations: LangUtils.getLocalizationMap('MINAGE_SUBCOMMAND_VIEW'),

            description: LangUtils.get('MINAGE_SUBCOMMAND_VIEW_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('MINAGE_SUBCOMMAND_VIEW_DESCRIPTION'),
        },
        {
            type: COMMAND_OPTION_TYPES.SUB_COMMAND,

            name: LangUtils.get('MINAGE_SUBCOMMAND_SET'),
            name_localizations: LangUtils.getLocalizationMap('MINAGE_SUBCOMMAND_SET'),

            description: LangUtils.get('MINAGE_SUBCOMMAND_SET_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('MINAGE_SUBCOMMAND_SET_DESCRIPTION'),

            options: [
                {
                    type: COMMAND_OPTION_TYPES.STRING,

                    name: LangUtils.get('MINAGE_OPTION'),
                    name_localizations: LangUtils.getLocalizationMap('MINAGE_OPTION'),

                    description: LangUtils.get('MINAGE_OPTION_DESCRIPTION'),
                    description_localizations: LangUtils.getLocalizationMap('MINAGE_OPTION_DESCRIPTION'),

                    required: true,
                },
            ],
        },
        {
            type: COMMAND_OPTION_TYPES.SUB_COMMAND,

            name: LangUtils.get('MINAGE_SUBCOMMAND_ENABLE'),
            name_localizations: LangUtils.getLocalizationMap('MINAGE_SUBCOMMAND_ENABLE'),

            description: LangUtils.get('MINAGE_SUBCOMMAND_ENABLE_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('MINAGE_SUBCOMMAND_ENABLE_DESCRIPTION'),
        },
        {
            type: COMMAND_OPTION_TYPES.SUB_COMMAND,

            name: LangUtils.get('MINAGE_SUBCOMMAND_DISABLE'),
            name_localizations: LangUtils.getLocalizationMap('MINAGE_SUBCOMMAND_DISABLE'),

            description: LangUtils.get('MINAGE_SUBCOMMAND_DISABLE_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('MINAGE_SUBCOMMAND_DISABLE_DESCRIPTION'),
        },
        {
            type: COMMAND_OPTION_TYPES.SUB_COMMAND,

            name: LangUtils.get('MINAGE_SUBCOMMAND_ACTION'),
            name_localizations: LangUtils.getLocalizationMap('MINAGE_SUBCOMMAND_ACTION'),

            description: LangUtils.get('MINAGE_SUBCOMMAND_ACTION_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('MINAGE_SUBCOMMAND_ACTION_DESCRIPTION'),

            options: [
                {
                    type: COMMAND_OPTION_TYPES.STRING,

                    name: LangUtils.get('MINAGE_OPTION_ACTION'),
                    name_localizations: LangUtils.getLocalizationMap('MINAGE_OPTION_ACTION'),

                    description: LangUtils.get('MINAGE_OPTION_ACTION_DESCRIPTION'),
                    description_localizations: LangUtils.getLocalizationMap('MINAGE_OPTION_ACTION_DESCRIPTION'),

                    required: true,
                    choices: [
                        {
                            name: LangUtils.get('MINAGE_OPTION_ACTION_KICK'),
                            name_localizations: LangUtils.getLocalizationMap('MINAGE_OPTION_ACTION_KICK'),
                            value: 'kick',
                        },
                        {
                            name: LangUtils.get('MINAGE_OPTION_ACTION_BAN'),
                            name_localizations: LangUtils.getLocalizationMap('MINAGE_OPTION_ACTION_BAN'),
                            value: 'ban',
                        },
                    ],
                },
            ],
        },
        {
            type: COMMAND_OPTION_TYPES.SUB_COMMAND,

            name: LangUtils.get('MINAGE_SUBCOMMAND_MESSAGE'),
            name_localizations: LangUtils.getLocalizationMap('MINAGE_SUBCOMMAND_MESSAGE'),

            description: LangUtils.get('MINAGE_SUBCOMMAND_MESSAGE_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('MINAGE_SUBCOMMAND_MESSAGE_DESCRIPTION'),

            options: [
                {
                    type: COMMAND_OPTION_TYPES.STRING,

                    name: LangUtils.get('MINAGE_OPTION_MESSAGE'),
                    name_localizations: LangUtils.getLocalizationMap('MINAGE_OPTION_MESSAGE'),

                    description: LangUtils.get('MINAGE_OPTION_MESSAGE_DESCRIPTION'),
                    description_localizations: LangUtils.getLocalizationMap('MINAGE_OPTION_MESSAGE_DESCRIPTION'),
                },
                {
                    type: COMMAND_OPTION_TYPES.BOOLEAN,

                    name: LangUtils.get('MINAGE_OPTION_RESET'),
                    name_localizations: LangUtils.getLocalizationMap('MINAGE_OPTION_RESET'),

                    description: LangUtils.get('MINAGE_OPTION_RESET_DESCRIPTION'),
                    description_localizations: LangUtils.getLocalizationMap('MINAGE_OPTION_RESET_DESCRIPTION'),
                },
            ],
        },
    ];

    hideSubcommands = true;

    async getDetails(locale?: Locale) {
        const cmdSet = await this.getLink(['MINAGE_NAME', 'MINAGE_SUBCOMMAND_SET'], locale);
        const cmdAction = await this.getLink(['MINAGE_NAME', 'MINAGE_SUBCOMMAND_ACTION'], locale);
        const cmdMessage = await this.getLink(['MINAGE_NAME', 'MINAGE_SUBCOMMAND_MESSAGE'], locale);
        const cmdEnable = await this.getLink(['MINAGE_NAME', 'MINAGE_SUBCOMMAND_ENABLE'], locale);
        const cmdDisable = await this.getLink(['MINAGE_NAME', 'MINAGE_SUBCOMMAND_DISABLE'], locale);
        let details = LangUtils.getAndReplace(
            'MINAGE_DETAILS',
            {
                cmdSet,
                cmdAction,
                cmdMessage,
                cmdEnable,
                cmdDisable,
            },
            locale
        );
        details += `\n\n${LangUtils.getAndReplace('MINAGE_VARIABLES', { cmdMessage }, locale)}`;
        details += `\n${LangUtils.getAndReplace(
            'MINAGE_VARIABLE_DURATION',
            {
                exampleDuration: `\`${TimeUtils.formatDuration(EXAMPLE_DURATION, locale)}\``,
            },
            locale
        )}`;
        details += `\n${LangUtils.getAndReplace(
            'MINAGE_VARIABLE_TIMESTAMP',
            {
                exampleTimestamp: TimeUtils.formatDate(EXAMPLE_TIMESTAMP),
            },
            locale
        )}`;
        details += `\n${LangUtils.getAndReplace(
            'MINAGE_VARIABLE_RELATIVE',
            {
                exampleRelative: TimeUtils.relative(EXAMPLE_TIMESTAMP),
            },
            locale
        )}`;
        return details;
    }

    async run(interaction: Interaction): CommandResponse {
        if (!('guild_id' in interaction)) {
            return this.respondKeyReplace(interaction, 'GUILD_ONLY', { command: this.name }, 'GUILD');
        }
        const authorID = interaction.member.user.id;
        if (!authorID) {
            return this.handleUnexpectedError(interaction, 'AUTHOR_UNKNOWN');
        }

        const current = await this.bot.db.guild.get(interaction.guild_id, { minage: 1 });
        const min = current?.minage;

        const subcommand = interaction.data?.options?.[0];
        switch (subcommand?.name) {
            case LangUtils.get('MINAGE_SUBCOMMAND_VIEW'): {
                let replyText = LangUtils.get('MINAGE_TITLE', interaction.locale);
                const emojiKey = min?.enabled ? 'ENABLED' : 'DISABLED';
                replyText += `\n${this.getEmoji(emojiKey, interaction)} `;
                replyText += LangUtils.get(`STATUS_${emojiKey}`, interaction.locale);
                replyText += `\n${this.getEmoji('TIME', interaction)} `;
                if (min?.duration) {
                    replyText += LangUtils.getAndReplace(
                        'MINAGE_DURATION',
                        {
                            duration: TimeUtils.formatDuration(min.duration, interaction.locale),
                        },
                        interaction.locale
                    );
                } else {
                    replyText += LangUtils.get('MINAGE_DURATION_NONE', interaction.locale);
                }
                replyText += `\n${this.getEmoji('ACTION', interaction)} `;
                const actionUpper = (min?.action || 'kick').toUpperCase() as Uppercase<MinAgeAction>;
                const actionLocalized = LangUtils.get(`MINAGE_OPTION_ACTION_${actionUpper}`, interaction.locale);
                replyText += LangUtils.getAndReplace(
                    'MINAGE_ACTION',
                    {
                        action: actionLocalized,
                    },
                    interaction.locale
                );
                replyText += `\n${this.getEmoji('MESSAGE', interaction)} `;
                replyText += LangUtils.getAndReplace(
                    'MINAGE_MESSAGE',
                    {
                        message: Replacers.minage(min?.duration, min?.message, interaction.locale),
                    },
                    interaction.locale
                );
                return this.respond(interaction, replyText);
            }
            case LangUtils.get('MINAGE_SUBCOMMAND_SET'): {
                const durationText = subcommand.options?.[0].value;
                if (!durationText || typeof durationText !== 'string') {
                    return this.handleUnexpectedError(interaction, 'ARGS_INVALID_TYPE');
                }

                const duration = TimeUtils.parseDuration(durationText);
                if (!duration || duration < MINAGE_DURATION_MINIMUM || duration > MINAGE_DURATION_MAXIMUM) {
                    return this.respondKeyReplace(
                        interaction,
                        'MINAGE_DURATION_SET_INVALID',
                        {
                            minimum: TimeUtils.formatDuration(MINAGE_DURATION_MINIMUM, interaction.locale),
                            maximum: TimeUtils.formatDuration(MINAGE_DURATION_MAXIMUM, interaction.locale),
                        },
                        'WARNING',
                        {
                            ephemeral: true,
                        }
                    );
                }

                return this.bot.db.guild
                    .update(interaction.guild_id, 'minage.duration', duration)
                    .then((result) => {
                        const replyText = LangUtils.getAndReplace(
                            `SETTING_UPDATE_${result.changes ? 'SUCCESS' : 'UNNECESSARY'}`,
                            {
                                setting: LangUtils.get('MINAGE_SETTING', interaction.locale),
                            },
                            interaction.locale
                        );
                        return this.respond(interaction, replyText, `SUCCESS${result.changes ? '' : '_ALT'}`);
                    })
                    .catch((err) => {
                        this.bot.logger.handleError(`/${this.name} set`, err);
                        return this.respondKeyReplace(
                            interaction,
                            'SETTING_UPDATE_FAILED',
                            {
                                setting: LangUtils.get('MINAGE_SETTING', interaction.locale),
                            },
                            'ERROR',
                            {
                                ephemeral: true,
                            }
                        );
                    });
            }
            case LangUtils.get('MINAGE_SUBCOMMAND_ENABLE'): {
                if (!min?.duration) {
                    const cmdLink = await this.getLink(
                        ['MINAGE_NAME', 'MINAGE_SUBCOMMAND_SET'],
                        interaction.locale
                    );
                    return this.respondKeyReplace(
                        interaction,
                        'MINAGE_ENABLED_SET_INVALID',
                        { commandLink: cmdLink },
                        'WARNING',
                        { ephemeral: true }
                    );
                }
                return this.bot.db.guild
                    .update(interaction.guild_id, 'minage.enabled', true)
                    .then((result) => {
                        const replyText = LangUtils.getAndReplace(
                            `SETTING_ENABLE_${result.changes ? 'SUCCESS' : 'UNNECESSARY'}`,
                            {
                                setting: LangUtils.get('MINAGE_SETTING', interaction.locale),
                            },
                            interaction.locale
                        );
                        return this.respond(interaction, replyText, `SUCCESS${result.changes ? '' : '_ALT'}`);
                    })
                    .catch((err) => {
                        this.bot.logger.handleError(`/${this.name} enable`, err);
                        return this.respondKeyReplace(
                            interaction,
                            'SETTING_ENABLE_FAILED',
                            {
                                setting: LangUtils.get('MINAGE_SETTING', interaction.locale),
                            },
                            'ERROR',
                            { ephemeral: true }
                        );
                    });
            }
            case LangUtils.get('MINAGE_SUBCOMMAND_DISABLE'): {
                return this.bot.db.guild
                    .update(interaction.guild_id, 'minage.enabled', false)
                    .then((result) => {
                        const replyText = LangUtils.getAndReplace(
                            `SETTING_DISABLE_${result.changes ? 'SUCCESS' : 'UNNECESSARY'}`,
                            {
                                setting: LangUtils.get('MINAGE_SETTING', interaction.locale),
                            },
                            interaction.locale
                        );
                        return this.respond(interaction, replyText, `SUCCESS${result.changes ? '' : '_ALT'}`);
                    })
                    .catch((err) => {
                        this.bot.logger.handleError(`/${this.name} disable`, err);
                        return this.respondKeyReplace(
                            interaction,
                            'SETTING_DISABLE_FAILED',
                            {
                                setting: LangUtils.get('MINAGE_SETTING', interaction.locale),
                            },
                            'ERROR',
                            { ephemeral: true }
                        );
                    });
            }
            case LangUtils.get('MINAGE_SUBCOMMAND_ACTION'): {
                const action = subcommand.options?.[0].value;
                if (!action || typeof action !== 'string' || !MINAGE_ACTIONS.includes(action as MinAgeAction)) {
                    return this.handleUnexpectedError(interaction, 'ARGS_INVALID_TYPE');
                }
                const actionUpper = action.toUpperCase() as Uppercase<MinAgeAction>;
                const actionLocalized = LangUtils.get(`MINAGE_OPTION_ACTION_${actionUpper}`, interaction.locale);

                return this.bot.db.guild
                    .update(interaction.guild_id, 'minage.action', action)
                    .then((result) => {
                        return this.respondSettingsResult(
                            interaction,
                            'MINAGE_SETTING_ACTION',
                            {
                                type: 'UPDATE',
                                result: result.changes ? 'SUCCESS' : 'UNNECESSARY',
                            },
                            `**${actionLocalized}**`
                        );
                    })
                    .catch((err) => {
                        this.bot.logger.handleError(`/${this.name} action`, err);
                        return this.respondSettingsResult(interaction, 'MINAGE_SETTING_ACTION', {
                            type: 'UPDATE',
                            result: 'FAILURE',
                        });
                    });
            }
            case LangUtils.get('MINAGE_SUBCOMMAND_MESSAGE'): {
                const message = subcommand.options?.find(
                    (opt) => opt.name === LangUtils.get('MINAGE_OPTION_MESSAGE')
                )?.value;
                const reset = subcommand.options?.find(
                    (opt) => opt.name === LangUtils.get('MINAGE_OPTION_RESET')
                )?.value;
                if (reset && message) {
                    return this.respondKey(interaction, 'MESSAGE_RESET_INVALID', 'WARNING', { ephemeral: true });
                } else if (reset) {
                    return this.bot.db.guild
                        .deleteValue(interaction.guild_id, 'minage.message')
                        .then((result) => {
                            return this.respondSettingsResult(interaction, 'MINAGE_SETTING_MESSAGE', {
                                type: 'RESET',
                                result: result.changes ? 'SUCCESS' : 'UNNECESSARY',
                            });
                        })
                        .catch((err) => {
                            this.bot.logger.handleError(`/${this.name} message`, err);
                            return this.respondSettingsResult(interaction, 'MINAGE_SETTING_MESSAGE', {
                                type: 'RESET',
                                result: 'FAILURE',
                            });
                        });
                }
                if (!message) {
                    return this.respondKey(interaction, 'MESSAGE_SET_INVALID', 'WARNING', { ephemeral: true });
                }
                if (typeof message !== 'string') {
                    return this.handleUnexpectedError(interaction, 'ARGS_INVALID_TYPE');
                }

                if (message.length > MINAGE_MESSAGE_LENGTH_MAXIMUM) {
                    return this.respondKeyReplace(
                        interaction,
                        'MESSAGE_TOO_LONG',
                        {
                            chars: MINAGE_MESSAGE_LENGTH_MAXIMUM,
                        },
                        'WARNING',
                        { ephemeral: true }
                    );
                }

                return this.bot.db.guild
                    .update(interaction.guild_id, 'minage.message', message)
                    .then((result) => {
                        return this.respondSettingsResult(interaction, 'MINAGE_SETTING_MESSAGE', {
                            type: 'UPDATE',
                            result: result.changes ? 'SUCCESS' : 'UNNECESSARY',
                        });
                    })
                    .catch((err) => {
                        this.bot.logger.handleError(`/${this.name} message`, err);
                        return this.respondSettingsResult(interaction, 'MINAGE_SETTING_MESSAGE', {
                            type: 'UPDATE',
                            result: 'FAILURE',
                        });
                    });
            }
            default:
                return this.handleUnexpectedError(interaction, 'INVALID_SUBCOMMAND');
        }
    }
}
