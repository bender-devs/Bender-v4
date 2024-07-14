import { MEMBER_MESSAGE_LENGTH_MAXIMUM } from '../data/dbLimits.js';
import type Bot from '../structures/bot.js';
import { SlashCommand } from '../structures/command.js';
import type { LangKey } from '../text/languageList.js';
import type { GuildDotFormatKey } from '../types/dbTypes.js';
import {
    CHANNEL_TYPES,
    COMMAND_OPTION_TYPES,
    MESSAGE_COMPONENT_TYPES,
    PERMISSIONS,
    TEXT_INPUT_STYLES,
} from '../types/numberTypes.js';
import type { Bitfield, CommandOption, CommandResponse, Interaction, Locale, Snowflake } from '../types/types.js';
import LangUtils from '../utils/language.js';
import type { EmojiKey } from '../utils/misc.js';
import PermissionUtils from '../utils/permissions.js';
import TextUtils from '../utils/text.js';

function getMessageOptions(descriptionKey: LangKey): CommandOption[] {
    return [
        {
            type: COMMAND_OPTION_TYPES.STRING,

            name: LangUtils.get('MEMBER_MSG_OPTION'),
            name_localizations: LangUtils.getLocalizationMap('MEMBER_MSG_OPTION'),

            description: LangUtils.get(descriptionKey),
            description_localizations: LangUtils.getLocalizationMap(descriptionKey),
        },
        {
            type: COMMAND_OPTION_TYPES.STRING,

            name: LangUtils.get('MEMBER_MSG_OPTION_RESET'),
            name_localizations: LangUtils.getLocalizationMap('MEMBER_MSG_OPTION_RESET'),

            description: LangUtils.get('MEMBER_MSG_OPTION_RESET_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('MEMBER_MSG_OPTION_RESET_DESCRIPTION'),
        },
    ];
}

function getMessageMarkdown(
    this: MemberMsgCommand,
    interaction: Interaction,
    settingNameKey: LangKey,
    message?: string | null,
    emojiKey?: EmojiKey
) {
    let msgMarkdown = `\n${emojiKey ? `${this.getEmoji(emojiKey, interaction)} ` : ''}`;
    msgMarkdown += `**${LangUtils.get(settingNameKey, interaction.locale)}**`;
    if (message) {
        msgMarkdown += `\n> ${message}`;
    } else {
        msgMarkdown += ` ${LangUtils.get('NONE', interaction.locale)}`;
    }
    return msgMarkdown;
}

export default class MemberMsgCommand extends SlashCommand {
    constructor(bot: Bot) {
        super(bot, LangUtils.get('MEMBER_MSG_NAME'));
    }
    readonly name_localizations = LangUtils.getLocalizationMap('MEMBER_MSG_NAME');

    readonly description = LangUtils.get('MEMBER_MSG_DESCRIPTION');
    readonly description_localizations = LangUtils.getLocalizationMap('MEMBER_MSG_DESCRIPTION');

    readonly default_member_permissions = `${PERMISSIONS.MANAGE_GUILD}` satisfies Bitfield;
    readonly dm_permission: boolean = false;

    readonly options: CommandOption[] = [
        {
            type: COMMAND_OPTION_TYPES.SUB_COMMAND,

            name: LangUtils.get('MEMBER_MSG_SUBCOMMAND_VIEW'),
            name_localizations: LangUtils.getLocalizationMap('MEMBER_MSG_SUBCOMMAND_VIEW'),

            description: LangUtils.get('MEMBER_MSG_SUBCOMMAND_VIEW_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('MEMBER_MSG_SUBCOMMAND_VIEW_DESCRIPTION'),
        },
        {
            type: COMMAND_OPTION_TYPES.SUB_COMMAND,

            name: LangUtils.get('MEMBER_MSG_SUBCOMMAND_CHANNEL'),
            name_localizations: LangUtils.getLocalizationMap('MEMBER_MSG_SUBCOMMAND_CHANNEL'),

            description: LangUtils.get('MEMBER_MSG_SUBCOMMAND_CHANNEL_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('MEMBER_MSG_SUBCOMMAND_CHANNEL_DESCRIPTION'),

            options: [
                {
                    type: COMMAND_OPTION_TYPES.CHANNEL,
                    channel_types: [CHANNEL_TYPES.GUILD_TEXT, CHANNEL_TYPES.GUILD_NEWS],

                    name: LangUtils.get('MEMBER_MSG_OPTION_CHANNEL'),
                    name_localizations: LangUtils.getLocalizationMap('MEMBER_MSG_OPTION_CHANNEL'),

                    description: LangUtils.get('MEMBER_MSG_OPTION_CHANNEL_DESCRIPTION'),
                    description_localizations: LangUtils.getLocalizationMap(
                        'MEMBER_MSG_OPTION_CHANNEL_DESCRIPTION'
                    ),

                    required: true,
                },
            ],
        },
        {
            type: COMMAND_OPTION_TYPES.SUB_COMMAND,

            name: LangUtils.get('MEMBER_MSG_SUBCOMMAND_SETUP'),
            name_localizations: LangUtils.getLocalizationMap('MEMBER_MSG_SUBCOMMAND_SETUP'),

            description: LangUtils.get('MEMBER_MSG_SUBCOMMAND_SETUP_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('MEMBER_MSG_SUBCOMMAND_SETUP_DESCRIPTION'),
        },
        {
            type: COMMAND_OPTION_TYPES.SUB_COMMAND,

            name: LangUtils.get('MEMBER_MSG_SUBCOMMAND_SETUP_DM'),
            name_localizations: LangUtils.getLocalizationMap('MEMBER_MSG_SUBCOMMAND_SETUP_DM'),

            description: LangUtils.get('MEMBER_MSG_SUBCOMMAND_SETUP_DM_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('MEMBER_MSG_SUBCOMMAND_SETUP_DM_DESCRIPTION'),
        },
        {
            type: COMMAND_OPTION_TYPES.SUB_COMMAND,

            name: LangUtils.get('MEMBER_MSG_SUBCOMMAND_JOIN'),
            name_localizations: LangUtils.getLocalizationMap('MEMBER_MSG_SUBCOMMAND_JOIN'),

            description: LangUtils.get('MEMBER_MSG_SUBCOMMAND_JOIN_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('MEMBER_MSG_SUBCOMMAND_JOIN_DESCRIPTION'),

            options: getMessageOptions('MEMBER_MSG_OPTION_JOIN_DESCRIPTION'),
        },
        {
            type: COMMAND_OPTION_TYPES.SUB_COMMAND,

            name: LangUtils.get('MEMBER_MSG_SUBCOMMAND_LEAVE'),
            name_localizations: LangUtils.getLocalizationMap('MEMBER_MSG_SUBCOMMAND_LEAVE'),

            description: LangUtils.get('MEMBER_MSG_SUBCOMMAND_LEAVE_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('MEMBER_MSG_SUBCOMMAND_LEAVE_DESCRIPTION'),

            options: getMessageOptions('MEMBER_MSG_OPTION_LEAVE_DESCRIPTION'),
        },
        {
            type: COMMAND_OPTION_TYPES.SUB_COMMAND,

            name: LangUtils.get('MEMBER_MSG_SUBCOMMAND_BAN'),
            name_localizations: LangUtils.getLocalizationMap('MEMBER_MSG_SUBCOMMAND_BAN'),

            description: LangUtils.get('MEMBER_MSG_SUBCOMMAND_BAN_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('MEMBER_MSG_SUBCOMMAND_BAN_DESCRIPTION'),

            options: getMessageOptions('MEMBER_MSG_OPTION_BAN_DESCRIPTION'),
        },
        {
            type: COMMAND_OPTION_TYPES.SUB_COMMAND,

            name: LangUtils.get('MEMBER_MSG_SUBCOMMAND_JOIN_DM'),
            name_localizations: LangUtils.getLocalizationMap('MEMBER_MSG_SUBCOMMAND_JOIN_DM'),

            description: LangUtils.get('MEMBER_MSG_SUBCOMMAND_JOIN_DM_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('MEMBER_MSG_SUBCOMMAND_JOIN_DM_DESCRIPTION'),

            options: getMessageOptions('MEMBER_MSG_OPTION_JOIN_DM_DESCRIPTION'),
        },
        {
            type: COMMAND_OPTION_TYPES.SUB_COMMAND,

            name: LangUtils.get('MEMBER_MSG_SUBCOMMAND_KICK_DM'),
            name_localizations: LangUtils.getLocalizationMap('MEMBER_MSG_SUBCOMMAND_KICK_DM'),

            description: LangUtils.get('MEMBER_MSG_SUBCOMMAND_KICK_DM_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('MEMBER_MSG_SUBCOMMAND_KICK_DM_DESCRIPTION'),

            options: getMessageOptions('MEMBER_MSG_OPTION_KICK_DM_DESCRIPTION'),
        },
        {
            type: COMMAND_OPTION_TYPES.SUB_COMMAND,

            name: LangUtils.get('MEMBER_MSG_SUBCOMMAND_BAN_DM'),
            name_localizations: LangUtils.getLocalizationMap('MEMBER_MSG_SUBCOMMAND_BAN_DM'),

            description: LangUtils.get('MEMBER_MSG_SUBCOMMAND_BAN_DM_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('MEMBER_MSG_SUBCOMMAND_BAN_DM_DESCRIPTION'),

            options: getMessageOptions('MEMBER_MSG_OPTION_BAN_DM_DESCRIPTION'),
        },
    ];

    async getDetails(locale?: Locale) {
        const cachedCommand = await this.bot.db.command.getByName(this.name);

        const commandName = LangUtils.get('MEMBER_MSG_NAME', locale);
        const setupSubcmd = LangUtils.get('MEMBER_MSG_SUBCOMMAND_SETUP', locale);
        const setupDMSubcmd = LangUtils.get('MEMBER_MSG_SUBCOMMAND_SETUP_DM', locale);

        if (!cachedCommand) {
            return LangUtils.getAndReplace(
                'MEMBER_MSG_DETAILS',
                {
                    setupCmd: `/${commandName} ${setupSubcmd}`,
                    setupDMCmd: `/${commandName} ${setupDMSubcmd}`,
                },
                locale
            );
        }

        const setupCmd = TextUtils.command.format(`${commandName} ${setupSubcmd}`, cachedCommand.id);
        const setupDMCmd = TextUtils.command.format(`${commandName} ${setupDMSubcmd}`, cachedCommand.id);

        return LangUtils.getAndReplace('MEMBER_MSG_DETAILS', { setupCmd, setupDMCmd }, locale);
    }

    async run(interaction: Interaction): CommandResponse {
        if (!('guild_id' in interaction)) {
            return this.respondKeyReplace(interaction, 'GUILD_ONLY', { command: this.name }, 'GUILD');
        }
        const authorID = interaction.member.user.id;
        if (!authorID) {
            return this.handleUnexpectedError(interaction, 'AUTHOR_UNKNOWN');
        }

        const subcommand = interaction.data?.options?.[0];

        const message = subcommand?.options?.find((opt) => opt.name === LangUtils.get('MEMBER_MSG_OPTION'))?.value;
        const reset = subcommand?.options?.find(
            (opt) => opt.name === LangUtils.get('MEMBER_MSG_OPTION_RESET')
        )?.value;
        if (message) {
            if (typeof message !== 'string') {
                return this.handleUnexpectedError(interaction, 'ARGS_INVALID_TYPE');
            }
            if (reset) {
                return this.respondKey(interaction, 'MESSAGE_RESET_INVALID', 'WARNING', { ephemeral: true });
            }
            if (message.length > MEMBER_MESSAGE_LENGTH_MAXIMUM) {
                return this.respondKeyReplace(
                    interaction,
                    'MESSAGE_TOO_LONG',
                    {
                        chars: MEMBER_MESSAGE_LENGTH_MAXIMUM,
                    },
                    'WARNING',
                    { ephemeral: true }
                );
            }
        }

        const current = await this.bot.db.guild.get(interaction.guild_id, { memberLog: 1 });
        const msgs = current?.memberLog;

        let settingKey: LangKey, dbKey: GuildDotFormatKey;

        switch (subcommand?.name) {
            case LangUtils.get('MEMBER_MSG_SUBCOMMAND_VIEW'): {
                let replyText = `## ${LangUtils.get('MEMBER_MSG_TITLE', interaction.locale)}`;

                replyText += `\n${this.getEmoji('CHANNEL_TEXT', interaction)} `;
                replyText += `__**${LangUtils.get('MEMBER_MSG_CHANNEL', interaction.locale)}**__ `;
                if (msgs?.channel) {
                    replyText += TextUtils.channel.format(msgs.channel);
                } else {
                    replyText += LangUtils.get('NONE', interaction.locale);
                }
                // TODO: message variable previews?
                replyText += getMessageMarkdown.bind(this)(interaction, 'MEMBER_MSG_JOIN', msgs?.join, 'JOIN');
                replyText += getMessageMarkdown.bind(this)(interaction, 'MEMBER_MSG_LEAVE', msgs?.leave, 'LEAVE');
                replyText += getMessageMarkdown.bind(this)(interaction, 'MEMBER_MSG_BAN', msgs?.ban, 'BAN');
                replyText += '\n';
                replyText += getMessageMarkdown.bind(this)(
                    interaction,
                    'MEMBER_MSG_JOIN_DM',
                    msgs?.joinDM,
                    'JOIN_DM'
                );
                replyText += getMessageMarkdown.bind(this)(
                    interaction,
                    'MEMBER_MSG_BAN_DM',
                    msgs?.banDM,
                    'BAN_DM'
                );
                replyText += getMessageMarkdown.bind(this)(
                    interaction,
                    'MEMBER_MSG_KICK_DM',
                    msgs?.kickDM,
                    'KICK'
                );

                return this.respond(interaction, replyText, undefined, { ephemeral: true, shareButton: true });
            }
            case LangUtils.get('MEMBER_MSG_SUBCOMMAND_CHANNEL'): {
                const channelID = subcommand?.options?.find(
                    (opt) => opt.name === LangUtils.get('MEMBER_MSG_OPTION_CHANNEL')
                )?.value;
                if (!channelID || typeof channelID !== 'string') {
                    return this.handleUnexpectedError(interaction, 'ARGS_INVALID_TYPE');
                }
                const channel = interaction.data?.resolved?.channels?.[channelID as Snowflake];
                if (!channel) {
                    return this.respondKey(interaction, 'ARGS_UNRESOLVED', 'ERROR', { ephemeral: true });
                }
                if (!PermissionUtils.has(channel.permissions, 'SEND_MESSAGES')) {
                    return this.respondMissingPermissions(interaction, TextUtils.channel.format(channel.id), [
                        'SEND_MESSAGES',
                    ]);
                }

                return this.bot.db.guild
                    .update(interaction.guild_id, 'memberLog.channel', channel.id)
                    .then((result) => {
                        return this.respondSettingsResult(interaction, 'MEMBER_MSG_SETTING_CHANNEL', {
                            type: 'UPDATE',
                            result: result.changes ? 'SUCCESS' : 'UNNECESSARY',
                        });
                    })
                    .catch((err) => {
                        this.bot.logger.handleError(`/${this.name} channel`, err);
                        return this.respondSettingsResult(interaction, 'MEMBER_MSG_SETTING_CHANNEL', {
                            type: 'UPDATE',
                            result: 'FAILURE',
                        });
                    });
            }
            case LangUtils.get('MEMBER_MSG_SUBCOMMAND_SETUP'): {
                this.bot.interactionUtils.addItem({ interaction, author: authorID, modal: true, dm: false });
                return this.respondWithModal(interaction, {
                    title: LangUtils.get('MEMBER_MSG_MODAL_TITLE', interaction.locale),
                    custom_id: `mm_${interaction.id}`,
                    components: [
                        {
                            type: MESSAGE_COMPONENT_TYPES.ACTION_ROW,
                            components: [
                                {
                                    type: MESSAGE_COMPONENT_TYPES.TEXT_INPUT,
                                    label: LangUtils.get('MEMBER_MSG_SETTING_JOIN', interaction.locale),
                                    custom_id: `mm_${interaction.id}_join`,
                                    style: TEXT_INPUT_STYLES.PARAGRAPH,
                                    max_length: MEMBER_MESSAGE_LENGTH_MAXIMUM,
                                    placeholder: LangUtils.get(
                                        'MEMBER_MSG_OPTION_JOIN_DESCRIPTION',
                                        interaction.locale
                                    ),
                                    required: false,
                                    value: msgs?.join || undefined,
                                },
                            ],
                        },
                        {
                            type: MESSAGE_COMPONENT_TYPES.ACTION_ROW,
                            components: [
                                {
                                    type: MESSAGE_COMPONENT_TYPES.TEXT_INPUT,
                                    label: LangUtils.get('MEMBER_MSG_SETTING_LEAVE', interaction.locale),
                                    custom_id: `mm_${interaction.id}_leave`,
                                    style: TEXT_INPUT_STYLES.PARAGRAPH,
                                    max_length: MEMBER_MESSAGE_LENGTH_MAXIMUM,
                                    placeholder: LangUtils.get(
                                        'MEMBER_MSG_OPTION_LEAVE_DESCRIPTION',
                                        interaction.locale
                                    ),
                                    required: false,
                                    value: msgs?.leave || undefined,
                                },
                            ],
                        },
                        {
                            type: MESSAGE_COMPONENT_TYPES.ACTION_ROW,
                            components: [
                                {
                                    type: MESSAGE_COMPONENT_TYPES.TEXT_INPUT,
                                    label: LangUtils.get('MEMBER_MSG_SETTING_BAN', interaction.locale),
                                    custom_id: `mm_${interaction.id}_ban`,
                                    style: TEXT_INPUT_STYLES.PARAGRAPH,
                                    max_length: MEMBER_MESSAGE_LENGTH_MAXIMUM,
                                    placeholder: LangUtils.get(
                                        'MEMBER_MSG_OPTION_BAN_DESCRIPTION',
                                        interaction.locale
                                    ),
                                    required: false,
                                    value: msgs?.ban || undefined,
                                },
                            ],
                        },
                    ],
                });
            }
            case LangUtils.get('MEMBER_MSG_SUBCOMMAND_SETUP_DM'): {
                this.bot.interactionUtils.addItem({ interaction, author: authorID, modal: true, dm: true });
                return this.respondWithModal(interaction, {
                    title: LangUtils.get('MEMBER_MSG_DM_MODAL_TITLE', interaction.locale),
                    custom_id: `mm_${interaction.id}_dm`,
                    components: [
                        {
                            type: MESSAGE_COMPONENT_TYPES.ACTION_ROW,
                            components: [
                                {
                                    type: MESSAGE_COMPONENT_TYPES.TEXT_INPUT,
                                    label: LangUtils.get('MEMBER_MSG_SETTING_JOIN_DM', interaction.locale),
                                    custom_id: `mm_${interaction.id}_join-dm`,
                                    style: TEXT_INPUT_STYLES.PARAGRAPH,
                                    max_length: MEMBER_MESSAGE_LENGTH_MAXIMUM,
                                    placeholder: LangUtils.get(
                                        'MEMBER_MSG_OPTION_JOIN_DM_DESCRIPTION',
                                        interaction.locale
                                    ),
                                    required: false,
                                    value: msgs?.joinDM || undefined,
                                },
                            ],
                        },
                        {
                            type: MESSAGE_COMPONENT_TYPES.ACTION_ROW,
                            components: [
                                {
                                    type: MESSAGE_COMPONENT_TYPES.TEXT_INPUT,
                                    label: LangUtils.get('MEMBER_MSG_SETTING_KICK_DM', interaction.locale),
                                    custom_id: `mm_${interaction.id}_kick-dm`,
                                    style: TEXT_INPUT_STYLES.PARAGRAPH,
                                    max_length: MEMBER_MESSAGE_LENGTH_MAXIMUM,
                                    placeholder: LangUtils.get(
                                        'MEMBER_MSG_OPTION_KICK_DM_DESCRIPTION',
                                        interaction.locale
                                    ),
                                    required: false,
                                    value: msgs?.kickDM || undefined,
                                },
                            ],
                        },
                        {
                            type: MESSAGE_COMPONENT_TYPES.ACTION_ROW,
                            components: [
                                {
                                    type: MESSAGE_COMPONENT_TYPES.TEXT_INPUT,
                                    label: LangUtils.get('MEMBER_MSG_SETTING_BAN_DM', interaction.locale),
                                    custom_id: `mm_${interaction.id}_ban-dm`,
                                    style: TEXT_INPUT_STYLES.PARAGRAPH,
                                    max_length: MEMBER_MESSAGE_LENGTH_MAXIMUM,
                                    placeholder: LangUtils.get(
                                        'MEMBER_MSG_OPTION_BAN_DM_DESCRIPTION',
                                        interaction.locale
                                    ),
                                    required: false,
                                    value: msgs?.banDM || undefined,
                                },
                            ],
                        },
                    ],
                });
            }
            case LangUtils.get('MEMBER_MSG_SUBCOMMAND_JOIN'): {
                settingKey = 'MEMBER_MSG_SETTING_JOIN';
                dbKey = 'memberLog.join';
                break;
            }
            case LangUtils.get('MEMBER_MSG_SUBCOMMAND_LEAVE'): {
                settingKey = 'MEMBER_MSG_SETTING_LEAVE';
                dbKey = 'memberLog.leave';
                break;
            }
            case LangUtils.get('MEMBER_MSG_SUBCOMMAND_BAN'): {
                settingKey = 'MEMBER_MSG_SETTING_BAN';
                dbKey = 'memberLog.ban';
                break;
            }
            case LangUtils.get('MEMBER_MSG_SUBCOMMAND_JOIN_DM'): {
                settingKey = 'MEMBER_MSG_SETTING_JOIN_DM';
                dbKey = 'memberLog.joinDM';
                break;
            }
            case LangUtils.get('MEMBER_MSG_SUBCOMMAND_BAN_DM'): {
                settingKey = 'MEMBER_MSG_SETTING_BAN_DM';
                dbKey = 'memberLog.banDM';
                break;
            }
            case LangUtils.get('MEMBER_MSG_SUBCOMMAND_KICK_DM'): {
                settingKey = 'MEMBER_MSG_SETTING_KICK_DM';
                dbKey = 'memberLog.kickDM';
                break;
            }
            default:
                return this.handleUnexpectedError(interaction, 'INVALID_SUBCOMMAND');
        }
        // valid subcommands fall through to here
        if (reset) {
            return this.bot.db.guild
                .deleteValue(interaction.guild_id, dbKey)
                .then((result) => {
                    return this.respondSettingsResult(interaction, settingKey, {
                        type: 'RESET',
                        result: result.changes ? 'SUCCESS' : 'UNNECESSARY',
                    });
                })
                .catch((err) => {
                    this.bot.logger.handleError(`/${this.name} ${dbKey.substring(10)}`, err);
                    return this.respondSettingsResult(interaction, settingKey, {
                        type: 'RESET',
                        result: 'FAILURE',
                    });
                });
        }
        if (!message) {
            return this.respondKey(interaction, 'MESSAGE_SET_INVALID', 'WARNING', { ephemeral: true });
        }

        return this.bot.db.guild
            .update(interaction.guild_id, dbKey, message)
            .then((result) => {
                return this.respondSettingsResult(interaction, settingKey, {
                    type: 'UPDATE',
                    result: result.changes ? 'SUCCESS' : 'UNNECESSARY',
                });
            })
            .catch((err) => {
                this.bot.logger.handleError(`/${this.name} ${dbKey.substring(10)}`, err);
                return this.respondSettingsResult(interaction, settingKey, {
                    type: 'UPDATE',
                    result: 'FAILURE',
                });
            });
    }
}
