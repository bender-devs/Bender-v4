class LanguageUtils {
    langs: Object;
    
    loadLangList() {
        // TODO: read ../text folder and import all JSONs
        const EN = require('../../text/EN.json');
        this.langs = { EN };
    }

    getAndReplace(id, replaceMap = {}, langID = 'EN') {

    }

    isValidLangID(langID) {
        
    }

    isSupportedLangID(langID) {
        return !!this.langs?.[langID];
    }
};