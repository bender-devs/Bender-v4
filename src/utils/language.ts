import * as langUtils from 'iso-lang-codes';
import { languages } from '../text/languageList';
import * as types from '../structures/types';

export default class LanguageUtils {

    static getAndReplace(id: string, replaceMap: types.ReplaceMap = {}, langID = 'en'): string {
        langID = langID.toLowerCase();
        if (!this.isSupportedLangID(langID)) {
            langID = 'en';
        }
        let text = languages[langID][id];
        for (const key in replaceMap) {
            const replaceRegex = new RegExp(`{{${key}}}`, 'g');
            text = text.replace(replaceRegex, replaceMap[key])
        }
        return text || '';
    }

    static isValidLangID(langID: string): boolean {
        return langUtils.validateLanguageCode(langID.toLowerCase());
    }

    static isSupportedLangID(langID: string): boolean {
        return langID.toLowerCase() in languages;
    }

    static getLanguage(langID: string): types.Lang {
        return languages[langID];
    }

    static getLanguageMap(): types.LangMap {
        return languages;
    }
};