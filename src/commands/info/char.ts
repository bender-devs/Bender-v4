import { DEFAULT_COLOR, ID_REGEX_EXACT } from '../../data/constants.js';
import type { CommandOptionValue, Embed, Interaction, URL } from '../../types/types.js';
import LangUtils from '../../utils/language.js';
import { EMOJI_REGEX_EXACT } from '../../utils/text.js';
import UnicodeUtils from '../../utils/unicode.js';
import type InfoCommand from '../info.js';
import emojiInfo from './emoji.js';
import IMAGES from '../../data/images.js';

export default async function (this: InfoCommand, interaction: Interaction, charString?: CommandOptionValue) {
    if (!charString || typeof charString !== 'string') {
        return this.handleUnexpectedError(interaction, 'ARGS_INVALID_TYPE');
    }
    // if provided a Discord emoji or Snowflake, redirect to /info emoji
    if (EMOJI_REGEX_EXACT.test(charString) || ID_REGEX_EXACT.test(charString)) {
        return emojiInfo.bind(this)(interaction, charString);
    }
    const firstChar = UnicodeUtils.getFirstSequence(charString);
    const charData = UnicodeUtils.getCharData(firstChar);
    if (!charData) {
        // TODO: show basic data if fetch fails
        return this.respondKey(interaction, 'CHAR_INFO_NO_DATA', 'WARNING', true);
    }

    const display = LangUtils.getAndReplace('CHAR_INFO_DISPLAY', { char: firstChar }, interaction.locale);
    const codes8 = LangUtils.getAndReplace('CHAR_INFO_UTF8', { 
        codes: UnicodeUtils.formatCodes(charData.codepoints_utf8, 8)
    }, interaction.locale);
    const codes16 = LangUtils.getAndReplace('CHAR_INFO_UTF16', { 
        codes: UnicodeUtils.formatCodes(charData.codepoints_utf16, 16)
    }, interaction.locale);
    const groupInfo = charData.category && charData.group && charData.subgroup ? LangUtils.getAndReplace('CHAR_INFO_GROUP', { 
        category: charData.category,
        group: charData.group,
        subgroup: charData.subgroup
    }, interaction.locale) : '';
    const variations = charData.variations ? LangUtils.getAndReplace('CHAR_INFO_VARIATIONS', {
        variations: charData.variations.join('  ')
    }, interaction.locale) : '';

    let links = '', imageLink = '';
    if (charData.is_emoji) {
        const infoName = LangUtils.get('CHAR_INFO_MORE_INFO', interaction.locale);
        const infoLink = `https://emojipedia.org/emoji/${encodeURIComponent(firstChar)}`;
        const imageName = LangUtils.get('CHAR_INFO_IMAGE_LINK', interaction.locale);
        imageLink = UnicodeUtils.getImageFromCodes(charData.codepoints_utf16);
        const vectorName = LangUtils.get('CHAR_INFO_VECTOR_LINK', interaction.locale);
        const vectorLink = UnicodeUtils.getImageFromCodes(charData.codepoints_utf16, true);
        links = `[${infoName}](${infoLink}) | [${imageName}](${imageLink}) | [${vectorName}](${vectorLink})`;
    } else {
        const infoName = LangUtils.get('CHAR_INFO_MORE_INFO', interaction.locale);
        // TODO: handle multi-char non-emoji sequences? (if applicable)
        const code = firstChar.codePointAt(0)?.toString(16);
        const infoLink = `https://www.fileformat.info/info/unicode/char/${code || ''}`;
        links = `[${infoName}](${infoLink})`;
    }

    const description = `${charData ? `${charData.description}\n\n` : ''}${display}${groupInfo ? `\n${groupInfo}` : ''}${variations ? `\n${variations}` : ''}\n\n${codes8}\n${codes16}\n\n${links}`;
    const embed: Embed = {
        author: {
            name: LangUtils.get('CHAR_INFO_TITLE', interaction.locale),
            icon_url: IMAGES.info
        },
        description,
        color: DEFAULT_COLOR
    };
    if (imageLink) {
        embed.thumbnail = { url: imageLink as URL }
    }
    return this.respond(interaction, { embeds: [embed] });
}
