import { LOCALE_LIST, Locale } from '../data/types';
import languages, { LangKey } from '../text/languageList';
import * as types from '../data/types';
import Logger from '../structures/logger';
import { DEFAULT_LANGUAGE, EXIT_CODE_NO_RESTART } from '../data/constants';
import TimeUtils from './time';

if (!languages[DEFAULT_LANGUAGE]) {
    console.error(`Default language invalid: No translation file exists for ${DEFAULT_LANGUAGE}!`);
    process.exit(EXIT_CODE_NO_RESTART);
}

export default class LanguageUtils {

    static get(key: LangKey, locale: Locale = DEFAULT_LANGUAGE): string {
        if (!this.discordSupportsLocale(locale)) {
            locale = DEFAULT_LANGUAGE;
        }
        // fallback to default if specified language's translation file doesn't exist
        // or if the key doesn't exist in that language's translation file
        return languages[locale]?.[key] || languages[DEFAULT_LANGUAGE]?.[key] || '';
    }

    static getAndReplace(key: LangKey, replaceMap: types.ReplaceMap = {}, locale: Locale = DEFAULT_LANGUAGE): string {
        let text = LanguageUtils.get(key, locale);
        for (const key in replaceMap) {
            const replaceRegex = new RegExp(`{{${key}}}`, 'g');
            text = text.replace(replaceRegex, replaceMap[key]);
        }
        return text;
    }

    static formatDateAgo(key: LangKey, timestamp: types.Timestamp | types.UnixTimestampMillis, locale?: Locale) {
        if (typeof timestamp === 'string') {
            timestamp = TimeUtils.parseTimestampMillis(timestamp);
        }
        const duration = TimeUtils.sinceMillis(timestamp);
        const formattedDate = TimeUtils.formatDate(timestamp, locale);
        const formattedDuration = TimeUtils.formatDuration(duration, locale);
        return LanguageUtils.getAndReplace(key, {
            date: formattedDate,
            ago: formattedDuration
        }, locale);
    }

    static discordSupportsLocale(locale: Locale): boolean {
        return LOCALE_LIST.includes(locale);
    }

    static getLocalizationMap(key: LangKey) {
        const dict: types.LocaleDict = {
            [DEFAULT_LANGUAGE]: LanguageUtils.get(key)
        }
        for (const locale in languages) {
            const lang = languages[locale];
            if (lang && key in lang) {
                dict[locale as Locale] = lang[key];
            }
        }
        return dict;
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
