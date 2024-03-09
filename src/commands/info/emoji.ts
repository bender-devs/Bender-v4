import { DEFAULT_COLOR, ID_REGEX_EXACT } from '../../data/constants.js';
import type { CommandOptionValue, Embed, Emoji, Interaction, Snowflake } from '../../types/types.js';
import CDNUtils from '../../utils/cdn.js';
import LangUtils from '../../utils/language.js';
import TextUtils from '../../utils/text.js';
import type InfoCommand from '../info.js';

export default async function (this: InfoCommand, interaction: Interaction, emojiString?: CommandOptionValue) {
    if (!emojiString || typeof emojiString !== 'string') {
        return this.handleUnexpectedError(interaction, 'ARGS_INVALID_TYPE');
    }
    if (Array.from(emojiString.substring(0, 2)).length === 1) {
        // TODO: run /info char instead?
    }
    let cachedEmoji: Emoji | null = null;
    if (ID_REGEX_EXACT.test(emojiString)) {
        cachedEmoji = this.bot.cache.emojis.find(emojiString as Snowflake);
    }
    const emoji = cachedEmoji || TextUtils.emoji.extract(emojiString);
    if (!emoji) {
        return this.respondKey(interaction, 'EMOJI_NOT_FOUND', 'WARNING', true);
    }

    const createdAt = TextUtils.timestamp.fromSnowflake(emoji.id);
    let description = LangUtils.formatDateAgo('EMOJI_INFO_CREATED_AT', createdAt, interaction.locale);
    description += `\n**ID:** ${emoji.id}\n`;
    if (!cachedEmoji) {
        cachedEmoji = this.bot.cache.emojis.find(emoji.id);
    }
    description += LangUtils.getAndReplace(
        'EMOJI_INFO_RAW_FORMAT',
        {
            emoji: TextUtils.emoji.parse(emoji, !cachedEmoji),
        },
        interaction.locale
    );

    if (emoji.managed) {
        description += `\n${LangUtils.getAndReplace(
            'EMOJI_INFO_MANAGED',
            {
                infoEmoji: this.getEmoji('INFO', interaction),
            },
            interaction.locale
        )}`;
    }
    if (emoji.roles?.length) {
        description += `\n${LangUtils.getAndReplace(
            'EMOJI_INFO_RESTRICTED',
            {
                roles: emoji.roles.map(TextUtils.mention.parseRole).join(', '),
            },
            interaction.locale
        )}`;
    }

    if (emoji.animated) {
        description += `\n${LangUtils.getAndReplace(
            'EMOJI_INFO_ANIMATED',
            {
                nitroEmoji: this.getEmoji('NITRO', interaction),
            },
            interaction.locale
        )}`;
    }

    const title = LangUtils.getAndReplace('EMOJI_INFO_TITLE', { emojiName: emoji.name }, interaction.locale);
    const url = CDNUtils.emojiURL(emoji.id, emoji.animated || false);
    const linkTitle = LangUtils.getAndReplace(
        'EMOJI_INFO_LINK',
        {
            linkEmoji: this.getEmoji('LINK', interaction),
        },
        interaction.locale
    );

    description += `\n\n[${linkTitle}](${url})`;

    const embed: Embed = {
        color: DEFAULT_COLOR,
        author: { name: title, icon_url: url },
        thumbnail: { url },
        description,
    };
    return this.respond(interaction, { embeds: [embed] });
}
