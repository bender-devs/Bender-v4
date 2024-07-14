import { STARBOARD_COUNT, STARBOARD_EMOJI } from '../data/defaults.js';
import type Bot from '../structures/bot.js';
import { SlashCommand } from '../structures/command.js';
import type { GuildSettings } from '../types/dbTypes.js';
import {
    CHANNEL_TYPES,
    COMMAND_OPTION_TYPES,
    INTERACTION_CALLBACK_FLAGS,
    MESSAGE_COMPONENT_TYPES,
    PERMISSIONS,
} from '../types/numberTypes.js';
import type {
    Bitfield,
    CommandOption,
    CommandOptionValue,
    CommandResponse,
    Emoji,
    Interaction,
    Locale,
    PartialChannel,
    Snowflake,
} from '../types/types.js';
import LangUtils from '../utils/language.js';
import PermissionUtils from '../utils/permissions.js';
import TextUtils from '../utils/text.js';
import UnicodeUtils from '../utils/unicode.js';

export default class StarboardCommand extends SlashCommand {
    constructor(bot: Bot) {
        super(bot, LangUtils.get('STARBOARD_NAME'));
    }
    readonly name_localizations = LangUtils.getLocalizationMap('STARBOARD_NAME');

    readonly description = LangUtils.get('STARBOARD_DESCRIPTION');
    readonly description_localizations = LangUtils.getLocalizationMap('STARBOARD_DESCRIPTION');

    readonly default_member_permissions = `${PERMISSIONS.KICK_MEMBERS}` satisfies Bitfield;
    readonly dm_permission: boolean = false;

    hideSubcommands = true;

    readonly options: CommandOption[] = [
        {
            type: COMMAND_OPTION_TYPES.SUB_COMMAND,

            name: LangUtils.get('STARBOARD_SUBCOMMAND_VIEW'),
            name_localizations: LangUtils.getLocalizationMap('STARBOARD_SUBCOMMAND_VIEW'),

            description: LangUtils.get('STARBOARD_SUBCOMMAND_VIEW_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('STARBOARD_SUBCOMMAND_VIEW_DESCRIPTION'),
        },
        {
            type: COMMAND_OPTION_TYPES.SUB_COMMAND,

            name: LangUtils.get('STARBOARD_SUBCOMMAND_SETUP'),
            name_localizations: LangUtils.getLocalizationMap('STARBOARD_SUBCOMMAND_SETUP'),

            description: LangUtils.get('STARBOARD_SUBCOMMAND_SETUP_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('STARBOARD_SUBCOMMAND_SETUP_DESCRIPTION'),

            options: [
                {
                    type: COMMAND_OPTION_TYPES.BOOLEAN,

                    name: LangUtils.get('STARBOARD_OPTION_ENABLED'),
                    name_localizations: LangUtils.getLocalizationMap('STARBOARD_OPTION_ENABLED'),

                    description: LangUtils.get('STARBOARD_OPTION_ENABLED_DESCRIPTION'),
                    description_localizations: LangUtils.getLocalizationMap(
                        'STARBOARD_OPTION_ENABLED_DESCRIPTION'
                    ),
                },
                {
                    type: COMMAND_OPTION_TYPES.INTEGER,

                    name: LangUtils.get('STARBOARD_OPTION_COUNT'),
                    name_localizations: LangUtils.getLocalizationMap('STARBOARD_OPTION_COUNT'),

                    description: LangUtils.get('STARBOARD_OPTION_COUNT_DESCRIPTION'),
                    description_localizations: LangUtils.getLocalizationMap('STARBOARD_OPTION_COUNT_DESCRIPTION'),

                    min_value: 1,
                },
                {
                    type: COMMAND_OPTION_TYPES.STRING,

                    name: LangUtils.get('STARBOARD_OPTION_EMOJI'),
                    name_localizations: LangUtils.getLocalizationMap('STARBOARD_OPTION_EMOJI'),

                    description: LangUtils.get('STARBOARD_OPTION_EMOJI_DESCRIPTION'),
                    description_localizations: LangUtils.getLocalizationMap('STARBOARD_OPTION_EMOJI_DESCRIPTION'),
                },
                {
                    type: COMMAND_OPTION_TYPES.CHANNEL,

                    name: LangUtils.get('STARBOARD_OPTION_CHANNEL'),
                    name_localizations: LangUtils.getLocalizationMap('STARBOARD_OPTION_CHANNEL'),

                    description: LangUtils.get('STARBOARD_OPTION_CHANNEL_DESCRIPTION'),
                    description_localizations: LangUtils.getLocalizationMap(
                        'STARBOARD_OPTION_CHANNEL_DESCRIPTION'
                    ),

                    channel_types: [CHANNEL_TYPES.GUILD_TEXT, CHANNEL_TYPES.GUILD_NEWS],
                },
            ],
        },
        {
            type: COMMAND_OPTION_TYPES.SUB_COMMAND,

            name: LangUtils.get('STARBOARD_SUBCOMMAND_ENABLE'),
            name_localizations: LangUtils.getLocalizationMap('STARBOARD_SUBCOMMAND_ENABLE'),

            description: LangUtils.get('STARBOARD_SUBCOMMAND_ENABLE_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('STARBOARD_SUBCOMMAND_ENABLE_DESCRIPTION'),
        },
        {
            type: COMMAND_OPTION_TYPES.SUB_COMMAND,

            name: LangUtils.get('STARBOARD_SUBCOMMAND_DISABLE'),
            name_localizations: LangUtils.getLocalizationMap('STARBOARD_SUBCOMMAND_DISABLE'),

            description: LangUtils.get('STARBOARD_SUBCOMMAND_DISABLE_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('STARBOARD_SUBCOMMAND_DISABLE_DESCRIPTION'),
        },
        {
            type: COMMAND_OPTION_TYPES.SUB_COMMAND,

            name: LangUtils.get('STARBOARD_SUBCOMMAND_COUNT'),
            name_localizations: LangUtils.getLocalizationMap('STARBOARD_SUBCOMMAND_COUNT'),

            description: LangUtils.get('STARBOARD_SUBCOMMAND_COUNT_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('STARBOARD_SUBCOMMAND_COUNT_DESCRIPTION'),

            options: [
                {
                    type: COMMAND_OPTION_TYPES.INTEGER,

                    name: LangUtils.get('STARBOARD_OPTION_COUNT'),
                    name_localizations: LangUtils.getLocalizationMap('STARBOARD_OPTION_COUNT'),

                    description: LangUtils.get('STARBOARD_OPTION_COUNT_DESCRIPTION'),
                    description_localizations: LangUtils.getLocalizationMap('STARBOARD_OPTION_COUNT_DESCRIPTION'),

                    required: true,
                    min_value: 1,
                },
            ],
        },
        {
            type: COMMAND_OPTION_TYPES.SUB_COMMAND,

            name: LangUtils.get('STARBOARD_SUBCOMMAND_CHANNEL'),
            name_localizations: LangUtils.getLocalizationMap('STARBOARD_SUBCOMMAND_CHANNEL'),

            description: LangUtils.get('STARBOARD_SUBCOMMAND_CHANNEL_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('STARBOARD_SUBCOMMAND_CHANNEL_DESCRIPTION'),

            options: [
                {
                    type: COMMAND_OPTION_TYPES.CHANNEL,

                    name: LangUtils.get('STARBOARD_OPTION_CHANNEL'),
                    name_localizations: LangUtils.getLocalizationMap('STARBOARD_OPTION_CHANNEL'),

                    description: LangUtils.get('STARBOARD_OPTION_CHANNEL_DESCRIPTION'),
                    description_localizations: LangUtils.getLocalizationMap(
                        'STARBOARD_OPTION_CHANNEL_DESCRIPTION'
                    ),

                    required: true,
                    channel_types: [CHANNEL_TYPES.GUILD_TEXT, CHANNEL_TYPES.GUILD_NEWS],
                },
            ],
        },
        {
            type: COMMAND_OPTION_TYPES.SUB_COMMAND,

            name: LangUtils.get('STARBOARD_SUBCOMMAND_EMOJI'),
            name_localizations: LangUtils.getLocalizationMap('STARBOARD_SUBCOMMAND_EMOJI'),

            description: LangUtils.get('STARBOARD_SUBCOMMAND_EMOJI_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('STARBOARD_SUBCOMMAND_EMOJI_DESCRIPTION'),

            options: [
                {
                    type: COMMAND_OPTION_TYPES.STRING,

                    name: LangUtils.get('STARBOARD_OPTION_EMOJI'),
                    name_localizations: LangUtils.getLocalizationMap('STARBOARD_OPTION_EMOJI'),

                    description: LangUtils.get('STARBOARD_OPTION_EMOJI_DESCRIPTION'),
                    description_localizations: LangUtils.getLocalizationMap('STARBOARD_OPTION_EMOJI_DESCRIPTION'),

                    required: true,
                },
            ],
        },
        {
            type: COMMAND_OPTION_TYPES.SUB_COMMAND,

            name: LangUtils.get('STARBOARD_SUBCOMMAND_BLACKLIST'),
            name_localizations: LangUtils.getLocalizationMap('STARBOARD_SUBCOMMAND_BLACKLIST'),

            description: LangUtils.get('STARBOARD_SUBCOMMAND_BLACKLIST_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('STARBOARD_SUBCOMMAND_BLACKLIST_DESCRIPTION'),
        },
    ];

    async getDetails(locale?: Locale) {
        return LangUtils.get('STARBOARD_DETAILS', locale);
    }

    getSettingsOverview(interaction: Interaction, starboard?: GuildSettings['starboard']) {
        let replyText = `## ${LangUtils.get('STARBOARD_TITLE', interaction.locale)}`;

        const emojiKey = starboard?.enabled ? 'ENABLED' : 'DISABLED';
        replyText += `\n${this.getEmoji(emojiKey, interaction)} `;
        replyText += LangUtils.get(`STATUS_${emojiKey}`, interaction.locale);

        replyText += `\n${this.getEmoji('COUNT', interaction)} `;
        replyText += LangUtils.getAndReplace(
            'STARBOARD_COUNT',
            {
                count: starboard?.count || STARBOARD_COUNT,
            },
            interaction.locale
        );

        replyText += '\n';
        replyText += LangUtils.getAndReplace(
            'STARBOARD_EMOJI',
            {
                emoji: starboard?.emoji || STARBOARD_EMOJI,
            },
            interaction.locale
        );

        replyText += `\n${this.getEmoji('CHANNEL_TEXT', interaction)} `;
        if (starboard?.channel) {
            replyText += LangUtils.getAndReplace(
                'STARBOARD_CHANNEL',
                {
                    channel: TextUtils.channel.format(starboard.channel),
                },
                interaction.locale
            );
        } else {
            replyText += LangUtils.get('STARBOARD_CHANNEL_NONE', interaction.locale);
        }

        replyText += `\n${this.getEmoji('BLACKLIST', interaction)} `;
        if (starboard?.blacklist) {
            replyText += LangUtils.getAndReplace(
                'STARBOARD_BLACKLIST',
                {
                    blacklist: starboard.blacklist.map((id) => TextUtils.channel.format(id)).join(', '),
                },
                interaction.locale
            );
        } else {
            replyText += LangUtils.getAndReplace(
                'STARBOARD_BLACKLIST',
                {
                    blacklist: LangUtils.get('NONE', interaction.locale),
                },
                interaction.locale
            );
        }

        return replyText;
    }

    /**
     * Resolves an emoji string to a custom emoji, a Unicode emoji, or null if not found.
     * @param emojiString The emoji string to resolve.
     * @param guildID The ID of the guild to resolve the emoji in.
     * @returns A custom emoji (Emoji object), a Unicode emoji (string), or null if not found.
     */
    private async resolveEmojiString(emojiString: string, guildID: Snowflake): Promise<Emoji | string | null> {
        // try resolving the emoji string to a custom emoji
        const emoji = await this.bot.utils.resolveEmoji(emojiString, guildID);
        let unicodeEmoji = '';
        // if not a custom emoji, try finding a Unicode emoji
        if (!emoji) {
            const firstChar = UnicodeUtils.getFirstSequence(emojiString);
            const charData = UnicodeUtils.getCharData(firstChar);
            // if not a Unicode emoji, return null
            if (!charData) {
                return null;
            }
            // resolve the Unicode emoji
            unicodeEmoji = firstChar;
        }
        // return the emoji or Unicode emoji
        return emoji || unicodeEmoji;
    }

    /**
     * Checks if the channel ID provided is valid and that the bot has the required permissions to send messages to it.
     * If the channel is not valid, it sends an error response to the interaction.
     *
     * @param interaction The interaction to respond to if there's an error.
     * @param channelID The ID of the channel to check.
     * @returns The channel object if it's valid, or an error response if it's not.
     */
    private validateChannel(
        interaction: Interaction,
        channelID?: CommandOptionValue
    ): PartialChannel | CommandResponse {
        // if the channel ID is not a string or if it's not defined,
        if (!channelID || typeof channelID !== 'string') {
            // return an error response
            return this.handleUnexpectedError(interaction, 'ARGS_INVALID_TYPE');
        }
        // get the channel object from the interaction's resolved data
        const channel = interaction.data?.resolved?.channels?.[channelID as Snowflake];
        // if the channel is not found,
        if (!channel) {
            // return an error response
            return this.respondKey(interaction, 'ARGS_UNRESOLVED', 'ERROR', { ephemeral: true });
        }
        // if the bot does not have the required permissions to send messages,
        if (!PermissionUtils.has(channel.permissions, 'SEND_MESSAGES')) {
            // return an error response
            return this.respondMissingPermissions(interaction, TextUtils.channel.format(channel.id), [
                'SEND_MESSAGES',
            ]);
        }
        // return the channel object if everything is valid
        return channel;
    }

    private validateCount(interaction: Interaction, count?: CommandOptionValue): CommandResponse | null {
        if (!count || typeof count !== 'number') {
            return this.handleUnexpectedError(interaction, 'ARGS_INVALID_TYPE');
        }
        if (count < 1) {
            return this.respondKey(interaction, 'STARBOARD_COUNT_INVALID', 'WARNING');
        }
        return null;
    }

    private async respondMissingChannel(interaction: Interaction): Promise<CommandResponse | null> {
        const cmdLink = await this.getLink(['STARBOARD_NAME', 'STARBOARD_SUBCOMMAND_CHANNEL'], interaction.locale);
        return this.respondKeyReplace(
            interaction,
            'STARBOARD_ENABLE_INVALID',
            { commandLink: cmdLink },
            'WARNING',
            { ephemeral: true }
        );
    }

    async run(interaction: Interaction): CommandResponse {
        if (!('guild_id' in interaction)) {
            return this.respondKeyReplace(interaction, 'GUILD_ONLY', { command: this.name }, 'GUILD');
        }
        const authorID = interaction.member.user.id;
        if (!authorID) {
            return this.handleUnexpectedError(interaction, 'AUTHOR_UNKNOWN');
        }

        const current = await this.bot.db.guild.get(interaction.guild_id, { starboard: 1 });
        const starboard = current?.starboard;

        const subcommand = interaction.data?.options?.[0];
        switch (subcommand?.name) {
            case LangUtils.get('STARBOARD_SUBCOMMAND_VIEW'): {
                const replyText = this.getSettingsOverview(interaction, starboard);

                return this.respond(interaction, replyText, undefined, { ephemeral: true, shareButton: true });
            }
            case LangUtils.get('STARBOARD_SUBCOMMAND_ENABLE'): {
                if (!starboard?.channel) {
                    return this.respondMissingChannel(interaction);
                }

                return this.bot.db.guild
                    .update(interaction.guild_id, 'starboard.enabled', true)
                    .then((result) => {
                        const replyText = LangUtils.getAndReplace(
                            `SETTING_ENABLE_${result.changes ? 'SUCCESS' : 'UNNECESSARY'}`,
                            {
                                setting: LangUtils.get('STARBOARD_SETTING', interaction.locale),
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
                                setting: LangUtils.get('STARBOARD_SETTING', interaction.locale),
                            },
                            'ERROR',
                            { ephemeral: true }
                        );
                    });
            }
            case LangUtils.get('STARBOARD_SUBCOMMAND_DISABLE'): {
                return this.bot.db.guild
                    .update(interaction.guild_id, 'starboard.enabled', false)
                    .then((result) => {
                        const replyText = LangUtils.getAndReplace(
                            `SETTING_DISABLE_${result.changes ? 'SUCCESS' : 'UNNECESSARY'}`,
                            {
                                setting: LangUtils.get('STARBOARD_NAME', interaction.locale),
                            },
                            interaction.locale
                        );
                        return this.respond(interaction, replyText, `SUCCESS${result.changes ? '' : '_ALT'}`, {
                            ephemeral: true,
                        });
                    })
                    .catch((err) => {
                        this.bot.logger.handleError(`/${this.name} disable`, err);
                        return this.respondKeyReplace(
                            interaction,
                            'SETTING_DISABLE_FAILED',
                            {
                                setting: LangUtils.get('STARBOARD_NAME', interaction.locale),
                            },
                            'ERROR',
                            { ephemeral: true }
                        );
                    });
            }
            case LangUtils.get('STARBOARD_SUBCOMMAND_COUNT'): {
                const args = interaction.data?.options;
                const count = args?.[0]?.options?.[0]?.value;

                const countInvalid = this.validateCount(interaction, count);
                if (countInvalid) {
                    return countInvalid;
                }

                return this.bot.db.guild
                    .update(interaction.guild_id, 'starboard.count', count)
                    .then((result) => {
                        return this.respondSettingsResult(
                            interaction,
                            'STARBOARD_SETTING_COUNT',
                            {
                                type: 'UPDATE',
                                result: result.changes ? 'SUCCESS' : 'UNNECESSARY',
                            },
                            `**${count}**`
                        );
                    })
                    .catch((err) => {
                        this.bot.logger.handleError(`/${this.name} count`, err);
                        return this.respondSettingsResult(interaction, 'STARBOARD_SETTING_COUNT', {
                            type: 'UPDATE',
                            result: 'FAILURE',
                        });
                    });
            }
            case LangUtils.get('STARBOARD_SUBCOMMAND_CHANNEL'): {
                const args = interaction.data?.options;
                const channelID = args?.[0]?.options?.[0]?.value;

                const channelOrResponse = await this.validateChannel(interaction, channelID);
                if (!channelOrResponse) {
                    return this.respondKey(interaction, 'CHANNEL_NOT_FOUND', 'WARNING', { ephemeral: true });
                }
                // If the result is not a channel, it must be a command response, therefore return it as is.
                if (!('permissions' in channelOrResponse)) {
                    return channelOrResponse;
                }
                // Otherwise, it must be a channel, so we can continue to update the starboard channel.

                return this.bot.db.guild
                    .update(interaction.guild_id, 'starboard.channel', channelID)
                    .then((result) => {
                        return this.respondSettingsResult(
                            interaction,
                            'STARBOARD_SETTING_CHANNEL',
                            {
                                type: 'UPDATE',
                                result: result.changes ? 'SUCCESS' : 'UNNECESSARY',
                            },
                            TextUtils.channel.format(channelOrResponse.id)
                        );
                    })
                    .catch((err) => {
                        this.bot.logger.handleError(`/${this.name} emoji`, err);
                        return this.respondSettingsResult(interaction, 'STARBOARD_SETTING_CHANNEL', {
                            type: 'UPDATE',
                            result: 'FAILURE',
                        });
                    });
            }
            case LangUtils.get('STARBOARD_SUBCOMMAND_EMOJI'): {
                const args = interaction.data?.options;
                const emojiString = args?.[0]?.options?.[0]?.value;

                if (!emojiString || typeof emojiString !== 'string') {
                    return this.handleUnexpectedError(interaction, 'ARGS_INVALID_TYPE');
                }

                const resolvedEmoji = await this.resolveEmojiString(emojiString, interaction.guild_id);

                if (resolvedEmoji === null) {
                    return this.respondKey(interaction, 'EMOJI_NOT_FOUND', 'ERROR', { ephemeral: true });
                }

                return this.bot.db.guild
                    .update(
                        interaction.guild_id,
                        'starboard.emoji',
                        typeof resolvedEmoji === 'string' ? resolvedEmoji : resolvedEmoji.id
                    )
                    .then((result) => {
                        return this.respondSettingsResult(
                            interaction,
                            'STARBOARD_SETTING_EMOJI',
                            {
                                type: 'UPDATE',
                                result: result.changes ? 'SUCCESS' : 'UNNECESSARY',
                            },
                            typeof resolvedEmoji === 'string'
                                ? resolvedEmoji
                                : TextUtils.emoji.formatCustom(resolvedEmoji)
                        );
                    })
                    .catch((err) => {
                        this.bot.logger.handleError(`/${this.name} emoji`, err);
                        return this.respondSettingsResult(interaction, 'STARBOARD_SETTING_EMOJI', {
                            type: 'UPDATE',
                            result: 'FAILURE',
                        });
                    });
            }
            case LangUtils.get('STARBOARD_SUBCOMMAND_SETUP'): {
                const args = interaction.data?.options;
                const enabledOption = args?.[0]?.options?.find(
                    (arg) => arg.name === LangUtils.get('STARBOARD_OPTION_ENABLED')
                );
                const channelOption = args?.[0]?.options?.find(
                    (arg) => arg.name === LangUtils.get('STARBOARD_OPTION_CHANNEL')
                );
                const countOption = args?.[0]?.options?.find(
                    (arg) => arg.name === LangUtils.get('STARBOARD_OPTION_COUNT')
                );
                const emojiOption = args?.[0]?.options?.find(
                    (arg) => arg.name === LangUtils.get('STARBOARD_OPTION_EMOJI')
                );

                if (!enabledOption && !channelOption && !countOption && !emojiOption) {
                    return this.respondKey(interaction, 'ARGS_MISSING', 'WARNING', { ephemeral: true });
                }

                const updateObj: Partial<GuildSettings['starboard']> = {};

                if (emojiOption) {
                    const emojiString = emojiOption.value;
                    if (typeof emojiString !== 'string') {
                        return this.handleUnexpectedError(interaction, 'ARGS_INVALID_TYPE');
                    }

                    const resolvedEmoji = await this.resolveEmojiString(emojiString, interaction.guild_id);
                    if (resolvedEmoji === null) {
                        return this.respondKey(interaction, 'EMOJI_NOT_FOUND', 'ERROR', { ephemeral: true });
                    }
                    updateObj.emoji = typeof resolvedEmoji === 'string' ? resolvedEmoji : resolvedEmoji.id;
                }

                if (channelOption) {
                    const channelID = channelOption.value;
                    const channelOrResponse = await this.validateChannel(interaction, channelID);
                    if (!channelOrResponse) {
                        return this.respondKey(interaction, 'CHANNEL_NOT_FOUND', 'WARNING', { ephemeral: true });
                    }
                    if (!('permissions' in channelOrResponse)) {
                        return channelOrResponse;
                    }
                    updateObj.channel = channelID as Snowflake;
                }

                if (countOption) {
                    const countInvalid = this.validateCount(interaction, countOption.value);
                    if (countInvalid) {
                        return countInvalid;
                    }
                    updateObj.count = countOption.value as number;
                }

                if (enabledOption) {
                    if (typeof enabledOption.value !== 'boolean') {
                        return this.handleUnexpectedError(interaction, 'ARGS_INVALID_TYPE');
                    }

                    const currentSettings = await this.bot.db.guild.get(interaction.guild_id, { starboard: 1 });
                    if (enabledOption.value && !currentSettings.starboard?.channel) {
                        return this.respondMissingChannel(interaction);
                    }
                    updateObj.enabled = enabledOption.value as boolean;
                }

                // don't allow enabling if channel is missing
                const currentSettings = await this.bot.db.guild.get(interaction.guild_id, { starboard: 1 });
                if (
                    (updateObj.enabled || (currentSettings.starboard?.enabled && !enabledOption)) &&
                    (updateObj.channel || (!updateObj.channel && !currentSettings.starboard?.channel))
                ) {
                    return this.respondMissingChannel(interaction);
                }

                return this.bot.db.guild.update(interaction.guild_id, 'starboard', updateObj).then((result) => {
                    if (!result.changes) {
                        return this.respondSettingsResult(interaction, 'STARBOARD_NAME', {
                            type: 'UPDATE',
                            result: 'UNNECESSARY',
                        });
                    }
                    return this.respondSettingsResult(interaction, 'STARBOARD_NAME', {
                        type: 'UPDATE',
                        result: 'SUCCESS',
                    });
                });
            }
            case LangUtils.get('STARBOARD_SUBCOMMAND_BLACKLIST'): {
                return this.respond(
                    interaction,
                    {
                        content: LangUtils.get('STARBOARD_BLACKLIST_INSTRUCTIONS', interaction.locale),
                        components: [
                            {
                                type: MESSAGE_COMPONENT_TYPES.ACTION_ROW,
                                components: [
                                    {
                                        type: MESSAGE_COMPONENT_TYPES.CHANNEL_SELECT,
                                        custom_id: `sb_${interaction.id}_blacklist`,
                                        channel_types: [
                                            CHANNEL_TYPES.GUILD_TEXT,
                                            CHANNEL_TYPES.GUILD_NEWS,
                                            CHANNEL_TYPES.GUILD_NEWS_THREAD,
                                            CHANNEL_TYPES.GUILD_PRIVATE_THREAD,
                                            CHANNEL_TYPES.GUILD_PUBLIC_THREAD,
                                        ],
                                    },
                                ],
                            },
                        ],
                        flags: INTERACTION_CALLBACK_FLAGS.EPHEMERAL,
                    },
                    undefined,
                    { ephemeral: true }
                );
            }
            default:
                return this.handleUnexpectedError(interaction, 'INVALID_SUBCOMMAND');
        }
    }
}
