import { ICommand, CommandUtils } from '../structures/command';
import Bot from '../structures/bot';
import * as types from '../types/types';
import { COMMAND_OPTION_TYPES } from '../types/numberTypes';
import * as textMap from '../types/text.json';
import LangUtils from '../utils/language';

const replaceRegex = {
    big: /[A-Z 0-9!?+#*-]/gi,
    box: /[a-z]/gi,
    'box-outline': /[a-z]/gi,
    bubble: /[A-Z0-9]/gi,
    'bubble-outline': /[A-Z0-9]/gi,
    fancy: /[a-z]/gi,
    flip: /./gi,
    fullwidth: /[!"#$%&'()*+,-./\d:;<=>?@a-z[\]^_`{|}~ ⦅⦆¯¦¬£¢₩¥]/gi,
    gothic: /[a-z 0-9]/gi,
    smallcaps: /[a-z]/gi,
    subscript: /[a-z()\-+=\d]/gi,
    superscript: /[a-z()\-+=\d]/gi
};
const textOpt: types.CommandOption = {
    type: COMMAND_OPTION_TYPES.STRING,
    name: 'text',
    description: 'The text to which to apply the effect.',
    required: true
};

// this command not localized as it only supports English characters

export default class TextCommand extends CommandUtils implements ICommand {
    constructor(bot: Bot) {
        super(bot, LangUtils.get('TEXT_NAME'));
    }
    readonly name_localizations = LangUtils.getLocalizationMap('TEXT_NAME');

    readonly description = LangUtils.get('TEXT_DESCRIPTION');
    readonly description_localizations = LangUtils.getLocalizationMap('TEXT_DESCRIPTION');

    readonly dm_permission: boolean = true;

    readonly options: types.CommandOption[] = [{
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,
        name: 'case',
        description: 'Change the case of text.',
        options: [{
            type: COMMAND_OPTION_TYPES.STRING,
            name: 'mode',
            description: 'How to change the text case.',
            choices: [
                { name: 'lowercase', value: 'lower' },
                { name: 'UPPERCASE', value: 'upper' },
                { name: 'AlTeRnAtInG', value: 'alt' },
                { name: 'rANdom', value: 'random' },
                { name: 'Title Case', value: 'title' },
                { name: 'inVERt => INverT', value: 'switch' }
            ],
            required: true
        }, textOpt]
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,
        name: 'big',
        description: 'Converts text to 🇪\u200B🇲\u200B🇴\u200B🇯\u200B🇮\u200B🇸.',
        options: [textOpt]
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,
        name: 'box',
        description: 'Converts text to 🅱🅾🆇🅴🅳 letters.',
        options: [textOpt]
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,
        name: 'box-outline',
        description: 'Converts text to 🄱🄾🅇🄴🄳 letters.',
        options: [textOpt]
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,
        name: 'bubble',
        description: 'Converts text to 🅑🅤🅑🅑🅛🅔 letters.',
        options: [textOpt]
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,
        name: 'bubble-outline',
        description: 'Converts text to ⓑⓤⓑⓑⓛⓔ letters.',
        options: [textOpt]
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,
        name: 'fancy',
        description: 'Converts text to 𝒻𝒶𝓃𝒸𝓎 letters.',
        options: [textOpt]
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,
        name: 'flip',
        description: 'Flips text (ノಠ _ ಠ)ノ︵ uʍop ǝpᴉsdn',
        options: [textOpt]
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,
        name: 'fullwidth',
        description: 'Converts text to ｆｕｌｌｗｉｄｔｈ characters.',
        options: [textOpt]
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,
        name: 'gothic',
        description: 'Converts text to 𝔤𝔬𝔱𝔥𝔦𝔠 letters.',
        options: [textOpt]
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,
        name: 'reverse',
        description: 'Reverses text 🔀 txet sesreveR',
        options: [textOpt]
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,
        name: 'smallcaps',
        description: 'Converts text to sᴍᴀʟʟᴄᴀᴘs.',
        options: [textOpt]
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,
        name: 'subscript',
        description: 'Converts text to ₛᵤᵦₛcᵣᵢₚₜ.',
        options: [textOpt]
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,
        name: 'superscript',
        description: 'Converts text to ˢᵘᵖᵉʳˢᶜʳⁱᵖᵗ.',
        options: [textOpt]
    }];

    async run(interaction: types.Interaction): types.CommandResponse {
        const effect = interaction.data?.options?.[0]?.name;
        let text = interaction.data?.options?.[0]?.options?.[0]?.value;
        if (!effect || !text || typeof text !== 'string') {
            return this.handleUnexpectedError(interaction, 'SUBCOMMANDS_OR_ARGS_INCOMPLETE');
        }
        if (effect === 'case') {
            return this.#doTextCase(interaction, text);
        }
        if (effect === 'flip' || effect === 'reverse') {
            text = Array.from(text).reverse().join('');
            if (effect === 'reverse') {
                if (Array.from(text).length > 1998) {
                    return this.respondKey(interaction, 'TEXT_TOO_LONG');
                }
                return this.respond(interaction, `🔀 ${text}`);
            }
        }
        if (effect === 'box' || effect === 'box-outline') {
            text = text.toUpperCase();
        }
        const effectKey = effect as keyof typeof textMap;
        let newText = text.replace(replaceRegex[effectKey], m => {
            const map = textMap[effectKey];
            const char = m in map ? map[m as keyof typeof map] : '';
            if (!char) {
                return m;
            }
            if (effectKey === 'big') {
                return `${char}\uFEFF`;
            }
            return char;
        });
        if (effect === 'flip') {
            newText = `(ノಠ _ ಠ)ノ︵ ${newText}`;
        }
        if (Array.from(newText).length > 2000) {
            return this.respondKey(interaction, 'TEXT_TOO_LONG');
        }
        return this.respond(interaction, newText);
    }

    async #doTextCase(interaction: types.Interaction, mode: string) {
        const text = interaction.data?.options?.[0]?.options?.[1]?.value;
        if (!text || typeof text !== 'string') {
            return this.handleUnexpectedError(interaction, 'ARGS_INCOMPLETE');
        }
        let newText = '';
        switch (mode) {
            case 'lower': {
                newText = text.toLowerCase();
                break;
            }
            case 'upper': {
                newText = text.toUpperCase();
                break;
            }
            case 'alt': {
                let c = -1;
                newText = text.replace(/[a-z]/gi, char => {
                    c++;
                    if (c % 2 === 0) {
                        return char.toUpperCase();
                    } else {
                        return char.toLowerCase();
                    }
                });
                break;
            }
            case 'random': {
                newText = text.replace(/[a-z]/gi, char => {
                    const randomBool = Math.random() > 0.5;
                    if (randomBool) {
                        return char.toUpperCase();
                    } else {
                        return char.toLowerCase();
                    }
                });
                break;
            }
            case 'title': {
                newText = text.replace(/\w\S*/g, function (txt) {
                    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
                });
                break;
            }
            case 'switch': {
                for (const char of text) {
                    if (/[a-z]/.test(char)) {
                        newText += char.toUpperCase();
                    } else if (/[A-Z]/.test(char)) {
                        newText += char.toLowerCase();
                    } else {
                        newText += char;
                    }
                }
                break;
            }
        }
        if (!newText) {
            return this.handleUnexpectedError(interaction, 'ARGS_INCOMPLETE');
        }
        return this.respond(interaction, newText);
    }
}
