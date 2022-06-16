import * as en_US from './en-US.json';
import * as nl_NL from './nl.json';
import * as de from './de.json';
import * as types from '../data/types';

export type LangKey = keyof typeof en_US;

const languages: types.LangMap = {
    'en-US': en_US,
    'nl': nl_NL,
    'de': de,
};
export default languages;
