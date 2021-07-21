import * as langUtils from 'iso-lang-codes';
import * as Languages from '../text/languageList';

export default class LanguageUtils {

    getAndReplace(id: string, replaceMap: Record<string, string> = {}, langID = 'en') {
        langID = langID.toLowerCase();
        if (!this.isSupportedLangID(langID)) {
            langID = 'en';
        }
        let text = Languages[langID][id];
        for (const key in replaceMap) {
            const replaceRegex = new RegExp(`{{${key}}}`, 'g');
            text = text.replace(replaceRegex, replaceMap[key])
        }
        return text || '';
    }

    isValidLangID(langID: string) {
        return langUtils.validateLanguageCode(langID.toLowerCase());
    }

    isSupportedLangID(langID: string) {
        return langID.toLowerCase() in Languages;
    }

    getLanguage(langID: string): Languages.LangMap {
        return Languages[langID];
    }
};