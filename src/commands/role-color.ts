import { COLOR_NAMES_LINK, HEX_COLOR_REGEX } from '../data/constants.js';
import type Bot from '../structures/bot.js';
import { SlashCommand } from '../structures/command.js';
import { COMMAND_OPTION_TYPES, PERMISSIONS } from '../types/numberTypes.js';
import type {
    Bitfield,
    CommandOption,
    CommandResponse,
    Embed,
    Interaction,
    Locale,
    Role,
    Snowflake,
} from '../types/types.js';
import LangUtils from '../utils/language.js';
import TextUtils from '../utils/text.js';
import colorNames from '../data/colorNames.json' assert { type: 'json' };

const roleOption: CommandOption = {
    type: COMMAND_OPTION_TYPES.ROLE,

    name: LangUtils.get('ROLE_COLOR_OPTION_ROLE'),
    name_localizations: LangUtils.getLocalizationMap('ROLE_COLOR_OPTION_ROLE'),

    description: LangUtils.get('ROLE_COLOR_OPTION_ROLE_DESCRIPTION'),
    description_localizations: LangUtils.getLocalizationMap('ROLE_COLOR_OPTION_ROLE_DESCRIPTION'),

    required: true,
};

export default class RoleColorCommand extends SlashCommand {
    constructor(bot: Bot) {
        super(bot, LangUtils.get('ROLE_COLOR_NAME'));
    }
    readonly name_localizations = LangUtils.getLocalizationMap('ROLE_COLOR_NAME');

    readonly description = LangUtils.get('ROLE_COLOR_DESCRIPTION');
    readonly description_localizations = LangUtils.getLocalizationMap('ROLE_COLOR_DESCRIPTION');

    readonly default_member_permissions = `${PERMISSIONS.MANAGE_ROLES}` satisfies Bitfield;
    readonly dm_permission: boolean = false;

    readonly options: CommandOption[] = [
        {
            type: COMMAND_OPTION_TYPES.SUB_COMMAND,

            name: LangUtils.get('ROLE_COLOR_SUBCOMMAND_VIEW'),
            name_localizations: LangUtils.getLocalizationMap('ROLE_COLOR_SUBCOMMAND_VIEW'),

            description: LangUtils.get('ROLE_COLOR_SUBCOMMAND_VIEW_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('ROLE_COLOR_SUBCOMMAND_VIEW_DESCRIPTION'),

            options: [roleOption],
        },
        {
            type: COMMAND_OPTION_TYPES.SUB_COMMAND,

            name: LangUtils.get('ROLE_COLOR_SUBCOMMAND_RESET'),
            name_localizations: LangUtils.getLocalizationMap('ROLE_COLOR_SUBCOMMAND_RESET'),

            description: LangUtils.get('ROLE_COLOR_SUBCOMMAND_RESET_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('ROLE_COLOR_SUBCOMMAND_RESET_DESCRIPTION'),

            options: [roleOption],
        },
        {
            type: COMMAND_OPTION_TYPES.SUB_COMMAND,

            name: LangUtils.get('ROLE_COLOR_SUBCOMMAND_SET'),
            name_localizations: LangUtils.getLocalizationMap('ROLE_COLOR_SUBCOMMAND_SET'),

            description: LangUtils.get('ROLE_COLOR_SUBCOMMAND_SET_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('ROLE_COLOR_SUBCOMMAND_SET_DESCRIPTION'),

            options: [
                roleOption,
                {
                    type: COMMAND_OPTION_TYPES.STRING,

                    name: LangUtils.get('ROLE_COLOR_OPTION_COLOR'),
                    name_localizations: LangUtils.getLocalizationMap('ROLE_COLOR_OPTION_COLOR'),

                    description: LangUtils.get('ROLE_COLOR_OPTION_COLOR_DESCRIPTION'),
                    description_localizations: LangUtils.getLocalizationMap('ROLE_COLOR_OPTION_COLOR_DESCRIPTION'),
                },
            ],
        },
    ];

    async getDetails(locale?: Locale) {
        return LangUtils.getAndReplace('ROLE_COLOR_DETAILS', { link: COLOR_NAMES_LINK }, locale);
    }

    async run(interaction: Interaction): CommandResponse {
        if (!('guild_id' in interaction)) {
            return this.respondKeyReplace(interaction, 'GUILD_ONLY', { command: this.name }, 'GUILD');
        }
        const authorID = interaction.member.user.id;
        if (!authorID) {
            return this.handleUnexpectedError(interaction, 'AUTHOR_UNKNOWN');
        }
        if (!interaction.member) {
            return this.handleUnexpectedError(interaction, 'AUTHOR_UNKNOWN');
        }

        const args = interaction.data?.options;
        const subcommand = args?.[0]?.name;
        const roleID = args?.[0]?.options?.find(
            (opt) => opt.name === LangUtils.get('ROLE_COLOR_OPTION_ROLE')
        )?.value;

        if (!roleID || typeof roleID !== 'string') {
            return this.handleUnexpectedError(interaction, 'ARGS_INVALID_TYPE');
        }

        let role: Role | null = null;
        if (interaction.data?.resolved?.roles && roleID in interaction.data.resolved.roles) {
            role = interaction.data.resolved.roles[roleID as Snowflake];
        }
        if (!role) {
            return this.handleUnexpectedError(interaction, 'ARGS_UNRESOLVED');
        }

        const roleMention = TextUtils.role.format(role.id);

        if (subcommand === LangUtils.get('ROLE_COLOR_SUBCOMMAND_VIEW')) {
            if (!role.color) {
                return this.respondKeyReplace(interaction, 'ROLE_COLOR_NONE', { role: roleMention }, 'WARNING', {
                    ephemeral: true,
                });
            }
            const hexColor = role.color.toString(16);
            const embed: Embed = {
                color: role.color,
                description: LangUtils.getAndReplace(
                    'ROLE_COLOR_EMBED_DESCRIPTION',
                    { role: roleMention, color: `#${hexColor}` },
                    interaction.locale
                ),
                thumbnail: {
                    url: `https://dummyimage.com/65x65/${hexColor}/${hexColor}`,
                },
            };
            return this.respond(interaction, { embeds: [embed] }, undefined, {
                ephemeral: true,
                shareButton: true,
            });
        }

        if (role.id === interaction.guild_id) {
            return this.respondKeyReplace(interaction, 'ROLE_COLOR_EVERYONE', { role: roleMention }, 'WARNING', {
                ephemeral: true,
            });
        }
        if (!this.bot.perms.matchesMemberCache(this.bot.user.id, 'MANAGE_ROLES', interaction.guild_id)) {
            return this.respondMissingPermissions(interaction, interaction.guild_id, ['MANAGE_ROLES']);
        }

        const editable = await this.bot.utils.editable(role, interaction.guild_id);
        if (editable === null) {
            return this.respondKey(interaction, 'GUILD_CACHE_FAILED', 'ERROR', { ephemeral: true });
        }
        if (!editable) {
            const response = LangUtils.getAndReplace(
                'ROLE_COLOR_PERMISSION_BOT',
                { role: roleMention },
                interaction.locale
            );
            return this.respond(
                interaction,
                {
                    content: response,
                    allowed_mentions: { parse: [] }, // don't @everyone
                },
                'HIERARCHY',
                { ephemeral: true }
            );
        }

        const editableByAuthor = await this.bot.utils.editableBy(role, interaction.guild_id, interaction.member);
        if (editableByAuthor === null) {
            return this.respondKey(interaction, 'GUILD_CACHE_FAILED', 'ERROR', { ephemeral: true });
        }
        if (!editableByAuthor) {
            const response = LangUtils.getAndReplace(
                'ROLE_COLOR_PERMISSION_USER',
                { role: roleMention },
                interaction.locale
            );
            return this.respond(
                interaction,
                {
                    content: response,
                    allowed_mentions: { parse: [] }, // don't @everyone
                },
                'HIERARCHY',
                { ephemeral: true }
            );
        }

        if (subcommand === LangUtils.get('ROLE_COLOR_SUBCOMMAND_RESET')) {
            if (!role.color) {
                return this.respondKeyReplace(
                    interaction,
                    'ROLE_COLOR_RESET_UNNECESSARY',
                    { role: roleMention },
                    'SUCCESS_ALT',
                    { ephemeral: true }
                );
            }
            return this.bot.api.role
                .edit(interaction.guild_id, role.id, { color: 0 })
                .then((newRole) => {
                    if (!newRole) {
                        return this.respondKeyReplace(
                            interaction,
                            'ROLE_COLOR_RESET_UNNECESSARY',
                            { role: roleMention },
                            'SUCCESS_ALT',
                            { ephemeral: true }
                        );
                    }
                    const respText = LangUtils.getAndReplace(
                        'ROLE_COLOR_RESET_SUCCESS',
                        { role: roleMention },
                        interaction.locale
                    );
                    return this.respond(interaction, respText, 'SUCCESS', { ephemeral: true });
                })
                .catch((err) => {
                    this.bot.logger.handleError(`/${this.name}`, err);
                    return this.respondKeyReplace(
                        interaction,
                        'ROLE_COLOR_RESET_FAILED',
                        { role: roleMention },
                        'WARNING'
                    );
                });
        }

        if (subcommand === LangUtils.get('ROLE_COLOR_SUBCOMMAND_SET')) {
            const colorString = args?.[0]?.options?.find(
                (opt) => opt.name === LangUtils.get('ROLE_COLOR_OPTION_COLOR')
            )?.value;
            if (!colorString || typeof colorString !== 'string') {
                return this.handleUnexpectedError(interaction, 'ARGS_INVALID_TYPE');
            }

            let finalColor: string;
            const mappedColor = colorNames[colorString as keyof typeof colorNames] || null;
            if (mappedColor) {
                finalColor = mappedColor;
            } else if (HEX_COLOR_REGEX.test(colorString)) {
                finalColor = colorString;
            } else {
                return this.respondKeyReplace(
                    interaction,
                    'ROLE_COLOR_SET_INVALID',
                    { link: COLOR_NAMES_LINK },
                    'ERROR'
                );
            }
            finalColor = finalColor.replace('#', '');
            const color = parseInt(finalColor, 16);
            if (isNaN(color)) {
                return this.handleUnexpectedError(interaction, 'ROLE_COLOR_PARSE_FAILED');
            }

            const hexColor = `#${finalColor}`;
            return this.bot.api.role
                .edit(interaction.guild_id, role.id, { color })
                .then((newRole) => {
                    if (!newRole) {
                        return this.respondKeyReplace(
                            interaction,
                            'ROLE_COLOR_SET_UNNECESSARY',
                            { role: roleMention, color: hexColor },
                            'SUCCESS_ALT',
                            { ephemeral: true }
                        );
                    }
                    const respText = LangUtils.getAndReplace(
                        'ROLE_COLOR_SET_SUCCESS',
                        { role: roleMention, color: hexColor },
                        interaction.locale
                    );
                    return this.respond(interaction, respText, 'SUCCESS', { ephemeral: true });
                })
                .catch((err) => {
                    this.bot.logger.handleError(`/${this.name}`, err);
                    return this.respondKeyReplace(
                        interaction,
                        'ROLE_COLOR_SET_FAILED',
                        { role: roleMention, color: hexColor },
                        'WARNING'
                    );
                });
        }

        return this.handleUnexpectedError(interaction, 'INVALID_SUBCOMMAND');
    }
}
