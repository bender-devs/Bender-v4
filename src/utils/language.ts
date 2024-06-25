import { DEFAULT_LANGUAGE, EXIT_CODE_NO_RESTART } from '../data/constants.js';
import type Logger from '../structures/logger.js';
import type { LangKey } from '../text/languageList.js';
import languages from '../text/languageList.js';
import { COMMAND_OPTION_TYPES } from '../types/numberTypes.js';
import type {
    CommandOption,
    InteractionData,
    Locale,
    LocaleDict,
    PermissionName,
    ReplaceMap,
    Snowflake,
    Timestamp,
    UnixTimestampMillis,
} from '../types/types.js';
import { LOCALE_LIST } from '../types/types.js';
import type { EmojiKey } from './misc.js';
import MiscUtils from './misc.js';
import Replacers from './replacers.js';
import TextUtils from './text.js';
import TimeUtils from './time.js';

if (!languages[DEFAULT_LANGUAGE]) {
    console.error(`Default language invalid: No translation file exists for ${DEFAULT_LANGUAGE}!`);
    process.exit(EXIT_CODE_NO_RESTART);
}

export default class LanguageUtils {
    static discordSupportsLocale(locale: Locale): boolean {
        return LOCALE_LIST.includes(locale);
    }

    static _get(key: LangKey, locale: Locale = DEFAULT_LANGUAGE): string | string[] {
        if (!this.discordSupportsLocale(locale)) {
            locale = DEFAULT_LANGUAGE;
        }
        /* fallback to default if specified language's translation file doesn't exist
         * or if the key doesn't exist in that language's translation file
         */
        return languages[locale]?.[key] || languages[DEFAULT_LANGUAGE]?.[key];
    }

    static get(key: LangKey, locale: Locale = DEFAULT_LANGUAGE): string {
        const result = this._get(key, locale);
        if (Array.isArray(result)) {
            return result[0] || '';
        }
        return result || '';
    }

    static getArr(key: LangKey, locale: Locale = DEFAULT_LANGUAGE): string[] {
        const result = this._get(key, locale);
        if (Array.isArray(result)) {
            return result;
        } else if (result) {
            return [result];
        }
        return [];
    }

    static getRandom(key: LangKey, locale: Locale = DEFAULT_LANGUAGE): string {
        const result = this._get(key, locale);
        if (Array.isArray(result)) {
            return MiscUtils.randomItem(result);
        }
        return result || '';
    }

    static getAndReplace(key: LangKey, replaceMap: ReplaceMap, locale: Locale = DEFAULT_LANGUAGE): string {
        const text = LanguageUtils.get(key, locale);
        return Replacers.replace(text, replaceMap, locale);
    }

    static getFromMap(fallback: string, localizationMap?: LocaleDict, locale?: Locale): string {
        if (!localizationMap) {
            return fallback;
        }
        if (!locale) {
            locale = DEFAULT_LANGUAGE;
        }
        const result = localizationMap[locale] || localizationMap[DEFAULT_LANGUAGE];
        if (Array.isArray(result)) {
            return result[0] || fallback;
        }
        return result || fallback;
    }

    static formatDateAgo(key: LangKey, timestamp: Timestamp | UnixTimestampMillis, locale?: Locale) {
        if (typeof timestamp === 'string') {
            timestamp = TimeUtils.parseTimestampMillis(timestamp);
        }
        const formattedDate = TimeUtils.formatDate(timestamp);
        const relativeDuration = TimeUtils.relative(timestamp);
        return LanguageUtils.getAndReplace(
            key,
            { dateRelative: `${formattedDate} (${relativeDuration})` },
            locale
        );
    }

    static formatNumber(num: number, locale?: Locale) {
        return num.toLocaleString(locale);
    }

    static getLocalizationMap(key: LangKey, emojiKey?: EmojiKey) {
        const emoji = emojiKey ? MiscUtils.getDefaultEmoji(emojiKey) : null;
        const dict: LocaleDict = {
            [DEFAULT_LANGUAGE]: emojiKey ? `${emoji} ${LanguageUtils.get(key)}` : LanguageUtils.get(key),
        };
        for (const locale in languages) {
            const lang = languages[locale];
            if (lang && key in lang) {
                if (emojiKey) {
                    dict[locale as Locale] = `${emoji} ${lang[key]}`;
                } else {
                    dict[locale as Locale] = lang[key];
                }
            }
        }
        return dict;
    }

    /** TODO: command links cannot be localized, see:
     * https://github.com/discord/discord-api-docs/issues/5518
     * for now this line will force the default language
     */
    static getCommandLink(langKeys: LangKey[], commandID: Snowflake) {
        const cmdNames = langKeys.map((key) => this.get(key));
        return TextUtils.mention.parseCommand(cmdNames.join(' '), commandID);
    }
    /** create a localized text version of a command link; used when a command isn't cached */
    static getCommandText(langKeys: LangKey[], locale?: Locale) {
        const cmdNames = langKeys.map((key) => this.get(key, locale));
        return `\`/${cmdNames.join(' ')}\``;
    }
    static getCommandFormat(options?: CommandOption[], locale?: Locale) {
        if (!options?.length) {
            return null;
        }
        // don't show format for top-level command with subcommands
        if (
            options[0].type === COMMAND_OPTION_TYPES.SUB_COMMAND ||
            options[0].type === COMMAND_OPTION_TYPES.SUB_COMMAND_GROUP
        ) {
            return false;
        }
        return options
            .map((opt) => {
                const name = this.getFromMap(opt.name, opt.name_localizations, locale);
                return opt.required ? `<${name}>` : `[${name}]`;
            })
            .join(' ');
    }
    static getSubcommandList(options?: CommandOption[], locale?: Locale) {
        if (!options?.length) {
            return null;
        }
        let subcommands: string[] = [];
        for (const opt of options) {
            if (opt.type === COMMAND_OPTION_TYPES.SUB_COMMAND_GROUP) {
                const groupName = this.getFromMap(opt.name, opt.name_localizations, locale);
                const cmds = this.getSubcommandList(opt.options);
                if (cmds) {
                    subcommands = subcommands.concat(cmds.map((cmd) => `${groupName} ${cmd}`));
                }
            } else if (opt.type === COMMAND_OPTION_TYPES.SUB_COMMAND) {
                subcommands.push(this.getFromMap(opt.name, opt.name_localizations, locale));
            }
        }
        return subcommands;
    }
    static getCommandOptionsString(data: InteractionData /*, locale?: Locale*/) {
        if (!data.options?.length) {
            return data.name;
        }
        const subcommands: string[] = [data.name];
        for (const opt of data.options) {
            if (
                opt.type === COMMAND_OPTION_TYPES.SUB_COMMAND_GROUP ||
                opt.type === COMMAND_OPTION_TYPES.SUB_COMMAND
            ) {
                // TODO: localization using cached commands w/ name_localizations
                subcommands.push(opt.name);
            }
        }
        if (!subcommands.length) {
            return null;
        }
        return subcommands.join(' ');
    }

    static getPermissionName(perm: PermissionName, locale?: Locale) {
        return LanguageUtils.get(`PERMISSION_${perm}`, locale);
    }

    /** handles special cases in formatting ordinal numbers (1st, 2nd, 3rd, etc.) */
    static formatOrdinalNumber(num: number, locale: Locale = DEFAULT_LANGUAGE) {
        if (locale === 'en-US' || locale === 'en-GB') {
            let suffix = 'th';
            if (num % 10 === 1 && num % 100 !== 11) {
                suffix = 'st';
            } else if (num % 10 === 2 && num % 100 !== 12) {
                suffix = 'nd';
            } else if (num % 10 === 3 && num % 100 !== 13) {
                suffix = 'rd';
            }
            return `${num.toLocaleString(locale)}${suffix}`;
        }
        // TODO: add other language-specific rules
        return this.getAndReplace('ORDINAL_NUMBER_FORMAT', { number: num }, locale);
    }

    static logLocalizationSupport(logger: Logger) {
        const langList = Object.keys(languages);
        logger.debug('LANGUAGES', `Loaded ${langList.length} languages: ${langList.join(', ')}`);
        logger.debug(
            'LANGUAGES',
            `Implementing ${langList.length}/${LOCALE_LIST.length} locales supported by Discord`
        );
        const defaultLangKeys = Object.keys(languages[DEFAULT_LANGUAGE]);
        for (const locale in languages) {
            if (!languages[locale]) {
                continue;
            }
            const keys = Object.keys(languages[locale]);
            if (keys.length < defaultLangKeys.length) {
                logger.moduleWarn(
                    'LANGUAGES',
                    `Language '${locale}' is incomplete (${keys.length}/${defaultLangKeys.length} keys.)`
                );
            }
        }
    }
}
