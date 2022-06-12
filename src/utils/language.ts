import { LOCALE_LIST, Locale } from '../data/types';
import languages, { LangKey } from '../text/languageList';
import * as types from '../data/types';

export default class LanguageUtils {

    static get(id: LangKey, langID: Locale = 'en-US'): string {
        if (!this.isSupportedLangID(langID)) {
            langID = 'en-US';
        }
        return this.getLanguage(langID)?.[id] || '';
    }

    static getAndReplace(id: LangKey, replaceMap: types.ReplaceMap = {}, langID: Locale = 'en-US'): string {
        let text = LanguageUtils.get(id, langID) || LanguageUtils.get(id, 'en-US');
        for (const key in replaceMap) {
            const replaceRegex = new RegExp(`{{${key}}}`, 'g');
            text = text.replace(replaceRegex, replaceMap[key]);
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
