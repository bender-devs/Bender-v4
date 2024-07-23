import type Bot from '../structures/bot.js';
import { SlashCommand } from '../structures/command.js';
import { COMMAND_OPTION_TYPES } from '../types/numberTypes.js';
import type { CommandResponse, Interaction, Snowflake } from '../types/types.js';
import LangUtils from '../utils/language.js';
import TextUtils from '../utils/text.js';

export default class SetNickCommand extends SlashCommand {
    constructor(bot: Bot) {
        super(bot, LangUtils.get('SET_NICK_NAME'));
    }
    readonly name_localizations = LangUtils.getLocalizationMap('SET_NICK_NAME');

    readonly description = LangUtils.get('SET_NICK_DESCRIPTION');
    readonly description_localizations = LangUtils.getLocalizationMap('SET_NICK_DESCRIPTION');

    readonly options = [
        {
            type: COMMAND_OPTION_TYPES.USER,

            name: LangUtils.get('SET_NICK_OPTION_USER'),
            name_localizations: LangUtils.getLocalizationMap('SET_NICK_OPTION_USER'),

            description: LangUtils.get('SET_NICK_OPTION_USER_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('SET_NICK_OPTION_USER_DESCRIPTION'),

            required: true,
        },
        {
            type: COMMAND_OPTION_TYPES.STRING,

            name: LangUtils.get('SET_NICK_OPTION_NICK'),
            name_localizations: LangUtils.getLocalizationMap('SET_NICK_OPTION_NICK'),

            description: LangUtils.get('SET_NICK_OPTION_NICK_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('SET_NICK_OPTION_NICK_DESCRIPTION'),
        },
    ];

    async run(interaction: Interaction): CommandResponse {
        if (!('guild_id' in interaction)) {
            return this.respondKeyReplace(interaction, 'GUILD_ONLY', { command: this.name }, 'GUILD');
        }

        const args = interaction.data?.options;
        const userString = args?.find((arg) => arg.name === LangUtils.get('SET_NICK_OPTION_USER'))?.value;
        if (!userString || typeof userString !== 'string') {
            return this.handleUnexpectedError(interaction, 'ARGS_INVALID_TYPE');
        }
        const userID = userString as Snowflake;
        const member = interaction.data?.resolved?.members?.[userID];
        if (!member) {
            return this.handleUnexpectedError(interaction, 'ARGS_UNRESOLVED');
        }

        if (!this.bot.perms.matchesMemberCache(this.bot.user.id, 'MANAGE_NICKNAMES', interaction.guild_id)) {
            return this.respondMissingPermissions(interaction, interaction.guild_id, ['MANAGE_NICKNAMES']);
        }

        const userMention = TextUtils.user.format(userID);

        const editable = await this.bot.utils.editable(member, interaction.guild_id);
        if (editable === null) {
            return this.respondKey(interaction, 'GUILD_CACHE_FAILED', 'ERROR', { ephemeral: true });
        }
        if (!editable) {
            const response = LangUtils.getAndReplace(
                'SET_NICK_PERMISSION_BOT',
                { user: userMention },
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

        const editableByAuthor = await this.bot.utils.editableBy(member, interaction.guild_id, interaction.member);
        if (editableByAuthor === null) {
            return this.respondKey(interaction, 'GUILD_CACHE_FAILED', 'ERROR', { ephemeral: true });
        }
        if (!editableByAuthor) {
            const response = LangUtils.getAndReplace(
                'SET_NICK_PERMISSION_USER',
                { user: userMention },
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

        const nick = args?.find((arg) => arg.name === LangUtils.get('SET_NICK_OPTION_NICK'))?.value;
        if (!nick) {
            if (!member.nick) {
                const responseText = LangUtils.getAndReplace(
                    'SET_NICK_RESET_UNNECESSARY',
                    { user: TextUtils.user.format(userID) },
                    interaction.locale
                );
                return this.respond(
                    interaction,
                    { content: responseText, allowed_mentions: { parse: [] } },
                    'SUCCESS_ALT'
                );
            }
            return this.bot.api.member
                .edit(interaction.guild_id, userID, { nick: null })
                .then(() => {
                    const responseText = LangUtils.getAndReplace(
                        'SET_NICK_RESET_SUCCESS',
                        { user: TextUtils.user.format(userID) },
                        interaction.locale
                    );
                    return this.respond(
                        interaction,
                        { content: responseText, allowed_mentions: { parse: [] } },
                        'SUCCESS'
                    );
                })
                .catch((err) => {
                    this.bot.logger.handleError(`/${this.name}`, 'Failed to reset nickname', err);
                    const responseText = LangUtils.getAndReplace(
                        'SET_NICK_RESET_FAILED',
                        { user: TextUtils.user.format(userID) },
                        interaction.locale
                    );
                    return this.respond(
                        interaction,
                        { content: responseText, allowed_mentions: { parse: [] } },
                        'ERROR'
                    );
                });
        } else if (typeof nick !== 'string') {
            return this.handleUnexpectedError(interaction, 'ARGS_INVALID_TYPE');
        }

        if (member.nick === nick) {
            const responseText = LangUtils.getAndReplace(
                'SET_NICK_UNNECESSARY',
                { user: TextUtils.user.format(userID) },
                interaction.locale
            );
            return this.respond(
                interaction,
                { content: responseText, allowed_mentions: { parse: [] } },
                'SUCCESS_ALT'
            );
        }
        return this.bot.api.member
            .edit(interaction.guild_id, userID, { nick: null })
            .then(() => {
                const responseText = LangUtils.getAndReplace(
                    'SET_NICK_SUCCESS',
                    { user: TextUtils.user.format(userID) },
                    interaction.locale
                );
                return this.respond(
                    interaction,
                    { content: responseText, allowed_mentions: { parse: [] } },
                    'SUCCESS'
                );
            })
            .catch((err) => {
                this.bot.logger.handleError(`/${this.name}`, 'Failed to set nickname', err);
                const responseText = LangUtils.getAndReplace(
                    'SET_NICK_FAILED',
                    { user: TextUtils.user.format(userID) },
                    interaction.locale
                );
                return this.respond(
                    interaction,
                    { content: responseText, allowed_mentions: { parse: [] } },
                    'ERROR'
                );
            });
    }
}
