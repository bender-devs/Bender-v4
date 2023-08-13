import { EXAMPLE_DURATION, EXAMPLE_TIMESTAMP } from '../data/constants.js';
import type { Locale, ReplaceMap } from '../types/types.js';
import LangUtils from './language.js';
import TimeUtils from './time.js';

export default class Replacers {
    static replace(text: string, replaceMap: ReplaceMap, locale?: Locale) {
        for (const key in replaceMap) {
            const replaceRegex = new RegExp(`{{${key}}}`, 'g');
            const replacement = replaceMap[key];
            const replaceText = typeof replacement === 'number' ? LangUtils.formatNumber(replacement, locale) : replacement;
            text = text.replace(replaceRegex, replaceText);
        }
        return text;
    }

    static minage(duration?: number, message?: string, locale?: Locale) {
        const durationText = TimeUtils.formatDuration(EXAMPLE_DURATION, locale);
        const timestamp = duration ? (Date.now() + duration) : EXAMPLE_TIMESTAMP;

        const replacements: ReplaceMap = {
            duration: durationText,
            timestamp: TimeUtils.formatDate(timestamp),
            timestampRelative: TimeUtils.relative(timestamp)
        };
        if (message) {
            return this.replace(message, replacements, locale);
        }
        return LangUtils.getAndReplace('MINAGE_DEFAULT_MESSAGE', replacements, locale);
    }
}