import { DEFAULT_COLOR, ID_REGEX_EXACT } from '../../data/constants';
import * as types from '../../types/types';
import CDNUtils from '../../utils/cdn';
import LangUtils from '../../utils/language';
import MiscUtils from '../../utils/misc';
import TextFormatUtils from '../../utils/textFormats';
import InfoCommand from '../info';

export default async function (this: InfoCommand, interaction: types.Interaction, emojiString?: types.CommandOptionValue) {
    if (!emojiString || typeof emojiString !== 'string') {
        return this.handleUnexpectedError(interaction, 'ARGS_INVALID_TYPE');
    }
    if (Array.from(emojiString.substring(0,2)).length === 1) {
        // TODO: run /info char instead?
    }
    let cachedEmoji: types.Emoji | null = null;
    if (ID_REGEX_EXACT.test(emojiString)) {
        cachedEmoji = this.bot.cache.emojis.find(emojiString as types.Snowflake);
    }
    const emoji = cachedEmoji || TextFormatUtils.emojis.extract(emojiString);
    if (!emoji) {
        return this.respondKey(interaction, 'EMOJI_NOT_FOUND');
    }

    const createdAt = MiscUtils.snowflakeToTimestamp(emoji.id);
    let description = LangUtils.formatDateAgo('EMOJI_INFO_CREATED_AT', createdAt, interaction.locale);
    description += `\n**ID:** ${emoji.id}\n`;
    if (!cachedEmoji) {
        cachedEmoji = this.bot.cache.emojis.find(emoji.id);
    }
    description += LangUtils.getAndReplace('EMOJI_INFO_RAW_FORMAT', {
        emoji: TextFormatUtils.emojis.parse(emoji, !cachedEmoji)
    }, interaction.locale);

    if (emoji.managed) {
        description += '\n' + LangUtils.get('EMOJI_INFO_MANAGED', interaction.locale);
    }
    if (emoji.roles?.length) {
        description += '\n' + LangUtils.getAndReplace('EMOJI_INFO_RESTRICTED', {
            roles: emoji.roles.map(id => `<@&${id}>`).join(', ')
        }, interaction.locale);
    }
        
    if (emoji.animated) {
        description += '\n' + LangUtils.get('EMOJI_INFO_ANIMATED', interaction.locale);
    }

    const title = LangUtils.getAndReplace('EMOJI_INFO_TITLE', { emojiName: emoji.name }, interaction.locale);
    const url = CDNUtils.emojiURL(emoji.id, emoji.animated || false);
    const linkTitle = LangUtils.get('EMOJI_INFO_LINK', interaction.locale);

    description += `\n\n[${linkTitle}](${url})`;

    return this.respondEmbed(interaction, {
        color: DEFAULT_COLOR,
        author: { name: title, icon_url: url },
        thumbnail: { url },
        description
    })
}
