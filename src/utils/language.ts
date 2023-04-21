import { LOCALE_LIST, Locale, PermissionName, LocaleDict, UnixTimestampMillis, Timestamp, ReplaceMap } from '../types/types';
import languages, { LangKey } from '../text/languageList';
import Logger from '../structures/logger';
import { DEFAULT_LANGUAGE, EXIT_CODE_NO_RESTART } from '../data/constants';
import TimeUtils from './time';
import MiscUtils, { EmojiKey } from './misc';

if (!languages[DEFAULT_LANGUAGE]) {
    console.error(`Default language invalid: No translation file exists for ${DEFAULT_LANGUAGE}!`);
    process.exit(EXIT_CODE_NO_RESTART);
}

export default class LanguageUtils {

    static discordSupportsLocale(locale: Locale): boolean {
        return LOCALE_LIST.includes(locale);
    }

    static _get(key: LangKey, locale: Locale = DEFAULT_LANGUAGE): string | string[] {
        if (!this.discordSupportsLocale(locale)) {
            locale = DEFAULT_LANGUAGE;
        }
        // fallback to default if specified language's translation file doesn't exist
        // or if the key doesn't exist in that language's translation file
        return languages[locale]?.[key] || languages[DEFAULT_LANGUAGE]?.[key];
    }

    static get(key: LangKey, locale: Locale = DEFAULT_LANGUAGE): string {
        const result = this._get(key, locale);
        if (Array.isArray(result)) {
            return result[0] || '';
        }
        return result || '';
    }

    static getArr(key: LangKey, locale: Locale = DEFAULT_LANGUAGE): string[] {
        const result = this._get(key, locale);
        if (Array.isArray(result)) {
            return result;
        } else if (result) {
            return [result];
        }
        return [];
    }

    static getRandom(key: LangKey, locale: Locale = DEFAULT_LANGUAGE): string {
        const result = this._get(key, locale);
        if (Array.isArray(result)) {
            return MiscUtils.randomItem(result);
        }
        return result || '';
    }

    static getAndReplace(key: LangKey, replaceMap: ReplaceMap, locale: Locale = DEFAULT_LANGUAGE): string {
        let text = LanguageUtils.get(key, locale);
        for (const key in replaceMap) {
            const replaceRegex = new RegExp(`{{${key}}}`, 'g');
            const replacement = replaceMap[key];
            const replaceText = typeof replacement === 'number' ? LanguageUtils.formatNumber(replacement, locale) : replacement;
            text = text.replace(replaceRegex, replaceText);
        }
        return text;
    }

    static formatDateAgo(key: LangKey, timestamp: Timestamp | UnixTimestampMillis, locale?: Locale) {
        if (typeof timestamp === 'string') {
            timestamp = TimeUtils.parseTimestampMillis(timestamp);
        }
        const formattedDate = TimeUtils.formatDate(timestamp);
        const relativeDuration = TimeUtils.relative(timestamp);
        return LanguageUtils.getAndReplace(key, { dateRelative: `${formattedDate} (${relativeDuration})` }, locale);
    }

    static formatNumber(num: number, locale?: Locale) {
        return num.toLocaleString(locale);
    }

    static getLocalizationMap(key: LangKey, emojiKey?: EmojiKey) {
        const emoji = emojiKey ? MiscUtils.getDefaultEmoji(emojiKey) : null;
        const dict: LocaleDict = {
            [DEFAULT_LANGUAGE]: emojiKey ? `${emoji} ${LanguageUtils.get(key)}` : LanguageUtils.get(key)
        }
        for (const locale in languages) {
            const lang = languages[locale];
            if (lang && key in lang) {
                if (emojiKey) {
                    dict[locale as Locale] = `${emoji} ${lang[key]}`;
                } else {
                    dict[locale as Locale] = lang[key];
                }
            }
        }
        return dict;
    }

    static getFriendlyPermissionName(perm: PermissionName, locale?: Locale) {
        return LanguageUtils.get(`PERMISSION_${perm}`, locale);
    }

    static logLocalizationSupport(logger: Logger) {
        const langList = Object.keys(languages);
        logger.debug('LANGUAGES', `Loaded ${langList.length} languages: ${langList.join(', ')}`);
        logger.debug('LANGUAGES', `Implementing ${langList.length}/${LOCALE_LIST.length} locales supported by Discord`);
        const defaultLangKeys = Object.keys(languages[DEFAULT_LANGUAGE]);
        for (const locale in languages) {
            if (!languages[locale]) {
                continue;
            }
            const keys = Object.keys(languages[locale]);
            if (keys.length < defaultLangKeys.length) {
                logger.moduleWarn('LANGUAGES', `Language '${locale}' is incomplete (${keys.length}/${defaultLangKeys.length} keys.)`);
            }
        }
    }
}
