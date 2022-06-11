import { LOCALE_LIST, Locale } from '../data/types';
import languages from '../text/languageList';
import * as types from '../data/types';

export default class LanguageUtils {

    static get(id: string, langID: Locale = 'en-US'): string {
        if (!this.isSupportedLangID(langID)) {
            langID = 'en-US';
        }
        return this.getLanguage(langID)?.[id] || '';
    }

    static getAndReplace(id: string, replaceMap: types.ReplaceMap = {}, langID: Locale = 'en-US'): string {
        let text = LanguageUtils.get(id, langID);
        for (const key in replaceMap) {
            const replaceRegex = new RegExp(`{{${key}}}`, 'g');
            text = text.replace(replaceRegex, replaceMap[key])
        }
        return text;
    }

    static isSupportedLangID(langID: Locale): boolean {
        return LOCALE_LIST.includes(langID);
    }

    static getLanguage(langID: Locale): types.Lang | undefined {
        return languages[langID];
    }

    static getLanguageMap(): types.LangMap {
        return languages;
    }
}