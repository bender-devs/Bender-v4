import { DEFAULT_COLOR, ID_REGEX_EXACT } from '../../data/constants';
import { CommandOptionValue, Embed, Interaction, URL } from '../../types/types';
import LangUtils from '../../utils/language';
import { EMOJI_REGEX_EXACT } from '../../utils/text';
import UnicodeUtils from '../../utils/unicode';
import InfoCommand from '../info';
import emojiInfo from './emoji';

export default async function (this: InfoCommand, interaction: Interaction, charString?: CommandOptionValue) {
    if (!charString || typeof charString !== 'string') {
        return this.handleUnexpectedError(interaction, 'ARGS_INVALID_TYPE');
    }
    // if provided a Discord emoji or Snowflake, redirect to /info emoji
    if (EMOJI_REGEX_EXACT.test(charString) || ID_REGEX_EXACT.test(charString)) {
        return emojiInfo.bind(this)(interaction, charString);
    }
    const emojiText = UnicodeUtils.getFirstSequence(charString);
    if (!emojiText) {
        // TODO: if unicode char but not an emoji?
        return this.respond(interaction, 'Couldn\'t detect a Unicode emoji - other chars are WIP', 'WARNING');
    }

    const emojiData = UnicodeUtils.getCharData(emojiText);
    if (!emojiData) {
        // TODO: if unicode char but not an emoji?
        return this.respondKey(interaction, 'CHAR_INFO_NO_DATA', 'WARNING');
    }

    const display = LangUtils.getAndReplace('CHAR_INFO_DISPLAY', { char: charString }, interaction.locale);
    const codes8 = LangUtils.getAndReplace('CHAR_INFO_UTF8', { 
        codes: emojiData.codepoints_utf8.map(code => `\`${code}\``).join(', ')
    }, interaction.locale);
    const codes16 = LangUtils.getAndReplace('CHAR_INFO_UTF16', { 
        codes: emojiData.codepoints_utf16.map(code => `\`${code}\``).join(', ')
    }, interaction.locale);
    const groupInfo = emojiData.category && emojiData.group && emojiData.subgroup ? LangUtils.getAndReplace('CHAR_INFO_GROUP', { 
        category: emojiData.category,
        group: emojiData.group,
        subgroup: emojiData.subgroup
    }, interaction.locale) : '';

    let links = '', imageLink = '';
    if (emojiData) {
        const infoName = LangUtils.get('CHAR_INFO_MORE_INFO', interaction.locale);
        const infoLink = `https://emojipedia.org/emoji/${encodeURIComponent(emojiText)}`;
        const imageName = LangUtils.get('CHAR_INFO_IMAGE_LINK', interaction.locale);
        imageLink = `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/72x72/${emojiData.codepoints_utf16.join('-')}.png`;
        const vectorName = LangUtils.get('CHAR_INFO_VECTOR_LINK', interaction.locale);
        const vectorLink = `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/${emojiData.codepoints_utf16.join('-')}.svg`;
        links = `[${infoName}](${infoLink}) | [${imageName}](${imageLink}) | [${vectorName}](${vectorLink})`;
    } else {
        const infoName = LangUtils.get('CHAR_INFO_MORE_INFO', interaction.locale);
        // TODO: handle multi-char non-emoji sequences? (if applicable)
        const infoLink = `https://www.fileformat.info/info/unicode/char/${emojiText.codePointAt(0) || ''}`;
        links = `[${infoName}](${infoLink})`;
    }

    const description = `${display}\n${codes8}\n${codes16}${groupInfo ? `\n${groupInfo}` : ''}\n\n${links}`;
    const embed: Embed = {
        title: LangUtils.getAndReplace('CHAR_INFO_TITLE', { char: charString }, interaction.locale),
        description,
        color: DEFAULT_COLOR
    };
    if (imageLink) {
        embed.image = { url: imageLink as URL }
    }
    return this.respond(interaction, { embeds: [embed] });
}
