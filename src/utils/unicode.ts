import { BaseEmoji, getEmojis } from 'unicode-emoji';
import unicodeData from 'cldr-annotations-derived-modern/annotationsDerived/en/annotations.json' assert { type: 'json' };
/*
 * TODO: localization for unicodeData
 * note that is is theoretically possible to manually localize some data from the unicode-emoji module;
 * however, it seems like the categories are currently fetched from an english-only source and/or hardcoded.
 */

const emojis = getEmojis();
const annotations = unicodeData.annotationsDerived.annotations;
type UnicodeSequence = keyof typeof annotations;
type CharData = {
    char: string;
    description: string;
    codepoints_utf8: string[];
    codepoints_utf16: string[];
    keywords?: string[];
    category?: string;
    group?: string;
    subgroup?: string;
    variations?: string[];
}
type Annotations = Record<UnicodeSequence, {
    default?: string[],
    tts: string[]
}>;
// to shorten the name and use a better type
const ann: Annotations = annotations;
// don't need to localize ths bit as language is not relevant to emojis
const splitter = new Intl.Segmenter('en', { granularity: 'grapheme' });

export default class UnicodeUtils {
    static findBaseEmoji(emoji: string): BaseEmoji | null {
        return emojis.find(emojiData => emojiData.emoji === emoji) ||
            emojis.find(emojiData => emojiData.variations?.find(variation => variation.emoji === emoji)) ||
            emojis.find(emojiData => emoji.startsWith(emojiData.emoji)) ||
            emojis.find(emojiData => emojiData.variations?.find(variation => emoji.startsWith(variation.emoji))) ||
            null;
    }
    static getAdditionalInfo(emoji: UnicodeSequence): Partial<CharData> | null {
        const baseEmoji = this.findBaseEmoji(emoji);
        if (!baseEmoji) {
            return null;
        }
        const extraData: Partial<CharData> = {
            category: baseEmoji.category,
            group: baseEmoji.group,
            subgroup: baseEmoji.subgroup
        }
        if (baseEmoji.emoji === emoji && baseEmoji.variations?.length) {
            extraData.variations = baseEmoji.variations.map(variation => variation.emoji);
        } else if (baseEmoji.variations?.length) { // if current emoji is a variation, include the original
            const vars = baseEmoji.variations.map(variation => variation.emoji);
            if (vars.includes(emoji)) {
                vars.splice(vars.indexOf(emoji), 1);
            }
            if (!vars.includes(baseEmoji.emoji)) {
                vars.push(baseEmoji.emoji);
            }
            extraData.variations = vars;
        }
        return extraData;
    }
    static getFirstSequence(text: string) {
        return [...splitter.segment(text)].map(seg => seg.segment)[0] || null;
    }
    static getCharData(text: string): CharData | null {
        const seqKey = text as UnicodeSequence;
        if (!ann[seqKey]) {
            return null;
        }
        const utf16: string[] = [];
        const utf8: string[] = [];
        for (const char of text) {
            const num = String.prototype.codePointAt.call(char, 0);
            if (num === undefined) {
                continue;
            }
            utf16.push(num.toString(16));
            if (char.length > 1) {
                for (const subchar of char.split('')) { // unlike iterating the string, .split('') breaks it into utf-8 chars
                    const subnum = String.prototype.codePointAt.call(subchar, 0);
                    if (subnum !== undefined) {
                        utf8.push(num.toString(16));
                    }
                }
            }
        }
        const data: CharData = {
            char: text,
            description: ann[seqKey].tts[0],
            keywords: ann[seqKey].default,
            codepoints_utf16: utf16,
            codepoints_utf8: utf8
        }
        // fetch additional information; namely groups
        const extraData = this.getAdditionalInfo(seqKey);
        if (extraData) {
            Object.assign(data, extraData);
        }
        return data;
    }
}