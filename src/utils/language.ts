import { LOCALE_LIST, Locale } from '../data/types';
import languages, { LangKey } from '../text/languageList';
import * as types from '../data/types';

const defaultLang = 'en-US';

export default class LanguageUtils {

    static get(key: LangKey, locale: Locale = defaultLang): string {
        if (!this.discordSupportsLocale(locale)) {
            locale = defaultLang;
        }
        // fallback to default if specified language's translation file doesn't exist
        // or if the key doesn't exist in that language's translation file
        const lang = this.getLanguage(locale) || this.getLanguage(defaultLang);
        return lang?.[key] || this.getLanguage(defaultLang)?.[key] || '';
    }

    static getAndReplace(key: LangKey, replaceMap: types.ReplaceMap = {}, locale: Locale = defaultLang): string {
        let text = LanguageUtils.get(key, locale);
        for (const key in replaceMap) {
            const replaceRegex = new RegExp(`{{${key}}}`, 'g');
            text = text.replace(replaceRegex, replaceMap[key]);
        }
        return text;
    }

    static discordSupportsLocale(locale: Locale): boolean {
        return LOCALE_LIST.includes(locale);
    }

    static getLanguage(locale: Locale): types.Lang | undefined {
        return languages[locale];
    }

    static getLocalizationMap(key: LangKey) {
        const dict: types.LocaleDict = {
            [defaultLang]: LanguageUtils.get(key)
        }
        let locale: Locale;
        for (locale in languages) {
            const lang = languages[locale];
            if (lang && key in lang) {
                dict[locale] = lang[key];
            }
        }
        return dict;
    }
}
