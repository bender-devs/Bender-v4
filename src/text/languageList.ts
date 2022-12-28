import * as en_US from './en-US.json';
import * as sv_SE from './sv-SE.json';
import * as nl_NL from './nl.json';
import * as de from './de.json';
import { LangMap } from '../types/types';

export type LangKey = keyof typeof en_US;

const languages: LangMap = {
    'en-US': en_US,
    'nl': nl_NL,
    'de': de,
    'sv-SE': sv_SE
};
export default languages;