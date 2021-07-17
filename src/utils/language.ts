import * as langUtils from 'iso-lang-codes';

export default class LanguageUtils {
    langs: Record<string, Record<string, string>>;

    constructor() {
        this.langs = {};
    }
    
    loadLangList() {
        // TODO: read ../text folder and import all JSONs
        const en = require('../../text/en.json');
        this.langs.en = en;
    }

    getAndReplace(id: string, replaceMap: Record<string, string> = {}, langID = 'en') {
        langID = langID.toLowerCase();
        if (!this.isSupportedLangID(langID)) {
            langID = 'en';
        }
        let text = this.langs[langID][id];
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
        return !!this.langs[langID.toLowerCase()];
    }
};