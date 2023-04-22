import en_US from './en-US.json' assert { type: 'json' };
import nl_NL from './nl.json' assert { type: 'json' };
import de from './de.json' assert { type: 'json' };
import { LangMap } from '../types/types.js';

export type LangKey = keyof typeof en_US;

const languages: LangMap = {
    'en-US': en_US,
    'nl': nl_NL,
    'de': de,
};
export default languages;