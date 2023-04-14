import { ICommand, CommandUtils } from '../structures/command';
import Bot from '../structures/bot';
import { Bitfield, CommandOption, CommandResponse, Emoji, Interaction, Snowflake } from '../types/types';
import LangUtils from '../utils/language';
import { COMMAND_OPTION_TYPES, MESSAGE_COMPONENT_TYPES, PERMISSIONS } from '../types/numberTypes';
import { ID_REGEX_EXACT } from '../data/constants';
import TextUtils, { EMOJI_REGEX_EXACT } from '../utils/text';

const emojiOption: CommandOption = {
    type: COMMAND_OPTION_TYPES.STRING,

    name: LangUtils.get('REM_OPTION_EMOJI'),
    name_localizations: LangUtils.getLocalizationMap('REM_OPTION_EMOJI'),

    description: LangUtils.get('REM_OPTION_EMOJI_DESCRIPTION'),
    description_localizations: LangUtils.getLocalizationMap('REM_OPTION_EMOJI_DESCRIPTION'),

    required: true
}

export default class RestrictEmojiCommand extends CommandUtils implements ICommand {
    constructor(bot: Bot) {
        super(bot, LangUtils.get('REM_NAME'));
    }
    readonly name_localizations = LangUtils.getLocalizationMap('REM_NAME');

    readonly description = LangUtils.get('REM_DESCRIPTION');
    readonly description_localizations = LangUtils.getLocalizationMap('REM_DESCRIPTION');

    readonly default_member_permissions = `${PERMISSIONS.MANAGE_EMOJIS_AND_STICKERS}` as Bitfield;
    readonly dm_permission: boolean = false;

    readonly options: CommandOption[] = [{
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,

        name: LangUtils.get('REM_SUBCOMMAND_VIEW'),
        name_localizations: LangUtils.getLocalizationMap('REM_SUBCOMMAND_VIEW'),
        
        description: LangUtils.get('REM_SUBCOMMAND_VIEW_DESCRIPTION'),
        description_localizations: LangUtils.getLocalizationMap('REM_SUBCOMMAND_VIEW_DESCRIPTION'),

        options: [emojiOption]
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,

        name: LangUtils.get('REM_SUBCOMMAND_RESET'),
        name_localizations: LangUtils.getLocalizationMap('REM_SUBCOMMAND_RESET'),
        
        description: LangUtils.get('REM_SUBCOMMAND_RESET_DESCRIPTION'),
        description_localizations: LangUtils.getLocalizationMap('REM_SUBCOMMAND_RESET_DESCRIPTION'),

        options: [emojiOption]
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,

        name: LangUtils.get('REM_SUBCOMMAND_SET'),
        name_localizations: LangUtils.getLocalizationMap('REM_SUBCOMMAND_SET'),
        
        description: LangUtils.get('REM_SUBCOMMAND_SET_DESCRIPTION'),
        description_localizations: LangUtils.getLocalizationMap('REM_SUBCOMMAND_SET_DESCRIPTION'),

        options: [emojiOption]
    }]

    async run(interaction: Interaction): CommandResponse {
        const authorID = interaction.member?.user.id || interaction.user?.id;
        if (!authorID) {
            return this.handleUnexpectedError(interaction, 'AUTHOR_UNKNOWN');
        }
        if (!interaction.guild_id) {
            return this.respondKeyReplace(interaction, 'GUILD_ONLY', { prefix: '/', command: this.name }, 'GUILD');
        }

        const args = interaction.data?.options;
        const subcommand = args?.[0]?.name;
        const emojiString = args?.[0]?.options?.[0]?.value;

        if (!emojiString || typeof emojiString !== 'string') {
            return this.handleUnexpectedError(interaction, 'ARGS_INVALID_TYPE');
        }
        let cachedEmoji: Emoji | null = null;
        const emojiRegexMatches = emojiString.match(EMOJI_REGEX_EXACT);
        if (emojiRegexMatches) {
            cachedEmoji = this.bot.cache.emojis.get(interaction.guild_id, emojiRegexMatches[2] as Snowflake);
        } else if (ID_REGEX_EXACT.test(emojiString)) {
            cachedEmoji = this.bot.cache.emojis.get(interaction.guild_id, emojiString as Snowflake);
        }

        let fetchedEmoji: Emoji | null = null;
        if (!cachedEmoji) {
            const partialEmoji = TextUtils.emoji.extract(emojiString);
            fetchedEmoji = partialEmoji ? await this.bot.api.emoji.fetch(interaction.guild_id, partialEmoji.id) : null;
        }
        const emoji = fetchedEmoji || cachedEmoji;
        if (!emoji) {
            return this.respondKey(interaction, 'EMOJI_NOT_FOUND', 'WARNING');
        }

        const currentRoles = emoji.roles || [];
        const botCanUse = !currentRoles.length || this.bot.perms.matchesMemberCache(this.bot.user.id, currentRoles, interaction.guild_id);
        const emojiText = TextUtils.emoji.parseDisplay(emoji, !botCanUse);

        if (subcommand === LangUtils.get('REM_SUBCOMMAND_VIEW')) {
            if (!currentRoles.length) {
                const respText = LangUtils.getAndReplace('REM_UNRESTRICTED', { emoji: emojiText }, interaction.locale);
                return this.respond(interaction, respText);
            }
            const respText = LangUtils.getAndReplace('REM_VIEW_ROLES', {
                emoji: emojiText,
                roles: currentRoles.map(id => TextUtils.mention.parseRole(id)).join(', ')
            }, interaction.locale);
            return this.respond(interaction, { content: respText, allowed_mentions: { parse: [] } });
        }
        
        if (!this.bot.perms.matchesMemberCache(this.bot.user.id, 'MANAGE_EMOJIS_AND_STICKERS', interaction.guild_id, interaction.channel_id)) {
			return this.respondMissingPermissions(interaction, interaction.guild_id, ['MANAGE_EMOJIS_AND_STICKERS']);
		}

        if (subcommand === LangUtils.get('REM_SUBCOMMAND_RESET')) {
            return this.bot.api.emoji.edit(interaction.guild_id, emoji.id, { roles: [] }).then(newEmoji => {
                if (!newEmoji) {
                    return this.respondKeyReplace(interaction, 'REM_RESET_UNNECESSARY', { emoji: emojiText }, 'SUCCESS_ALT');
                }
                const respText = LangUtils.getAndReplace('REM_RESET', { emoji: emojiText }, interaction.locale);
                return this.respond(interaction, respText, 'SUCCESS');
            }).catch(err => {
                this.bot.logger.handleError('/restrict-emoji', err);
                return this.respondKeyReplace(interaction, 'REM_EDIT_FAILED', { emoji: emojiText }, 'WARNING');
            })
        }

        let promptText = LangUtils.getAndReplace('REM_SET_PROMPT', { emoji: emojiText }, interaction.locale);
        promptText = `${this.getEmoji('INFO', interaction)} ${promptText}`;

        return this.respond(interaction, {
            content: promptText,
            components: [{
                type: 1,
                components: [{
                    type: MESSAGE_COMPONENT_TYPES.ROLE_SELECT,
                    custom_id: `rem_${interaction.id}`,
                    min_values: 1,
                    max_values: 25
                }]
            }]
        }).then(msg => {
            this.bot.interactionUtils.addItem({ interaction, author: authorID, emoji, emojiText });
            return msg;
        })
    }

}
