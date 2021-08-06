import * as en from './EN.json';

export type LangMap = Record<string, Lang>;

export type Lang = Record<string, string>;

export const languages: LangMap = { en };