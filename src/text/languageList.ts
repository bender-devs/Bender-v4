import * as en_US from './en-US.json';
import * as sv_SE from './sv-SE.json';
import * as nl_NL from './nl.json';
import * as types from '../data/types';

export type LangKey = keyof typeof en_US;

const languages: types.LangMap = {
    'en-US': en_US,
    'nl': nl_NL,
    'sv-SE': sv_SE
};
export default languages;