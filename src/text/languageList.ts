import * as en_US from './en-US.json';
import * as types from '../data/types';

export type LangKey = keyof typeof en_US;

const languages: types.LangMap = {
    'en-US': en_US
};
export default languages;