import { DEFAULT_COLOR, ID_REGEX_EXACT } from '../../data/constants';
import { CommandOptionValue, Emoji, Interaction, Snowflake } from '../../types/types';
import CDNUtils from '../../utils/cdn';
import LangUtils from '../../utils/language';
import TextUtils from '../../utils/text';
import InfoCommand from '../info';

export default async function (this: InfoCommand, interaction: Interaction, emojiString?: CommandOptionValue) {
    if (!emojiString || typeof emojiString !== 'string') {
        return this.handleUnexpectedError(interaction, 'ARGS_INVALID_TYPE');
    }
    if (Array.from(emojiString.substring(0,2)).length === 1) {
        // TODO: run /info char instead?
    }
    let cachedEmoji: Emoji | null = null;
    if (ID_REGEX_EXACT.test(emojiString)) {
        cachedEmoji = this.bot.cache.emojis.find(emojiString as Snowflake);
    }
    const emoji = cachedEmoji || TextUtils.emoji.extract(emojiString);
    if (!emoji) {
        return this.respondKey(interaction, 'EMOJI_NOT_FOUND', 'WARNING');
    }

    const createdAt = TextUtils.timestamp.fromSnowflake(emoji.id);
    let description = LangUtils.formatDateAgo('EMOJI_INFO_CREATED_AT', createdAt, interaction.locale);
    description += `\n**ID:** ${emoji.id}\n`;
    if (!cachedEmoji) {
        cachedEmoji = this.bot.cache.emojis.find(emoji.id);
    }
    description += LangUtils.getAndReplace('EMOJI_INFO_RAW_FORMAT', {
        emoji: TextUtils.emoji.parse(emoji, !cachedEmoji)
    }, interaction.locale);

    if (emoji.managed) {
        description += `\n${LangUtils.getAndReplace('EMOJI_INFO_MANAGED', {
            infoEmoji: this.getEmoji('INFO_MINI', interaction)
        }, interaction.locale)}`;
    }
    if (emoji.roles?.length) {
        description += `\n${LangUtils.getAndReplace('EMOJI_INFO_RESTRICTED', {
            roles: emoji.roles.map(id => `<@&${id}>`).join(', ')
        }, interaction.locale)}`;
    }
        
    if (emoji.animated) {
        description += `\n${LangUtils.getAndReplace('EMOJI_INFO_ANIMATED', {
            nitroEmoji: this.getEmoji('NITRO', interaction)
        }, interaction.locale)}`;
    }

    const title = LangUtils.getAndReplace('EMOJI_INFO_TITLE', { emojiName: emoji.name }, interaction.locale);
    const url = CDNUtils.emojiURL(emoji.id, emoji.animated || false);
    const linkTitle = LangUtils.getAndReplace('EMOJI_INFO_LINK', {
        linkEmoji: this.getEmoji('LINK', interaction)
    }, interaction.locale);

    description += `\n\n[${linkTitle}](${url})`;

    return this.respond(interaction, {
        color: DEFAULT_COLOR,
        author: { name: title, icon_url: url },
        thumbnail: { url },
        description
    })
}
