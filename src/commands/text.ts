import { ICommand, CommandUtils } from '../structures/command';
import * as path from 'path';
import Bot from '../structures/bot';
import * as types from '../data/types';
import { COMMAND_OPTION_TYPES } from '../data/numberTypes';
import * as textMap from '../data/text.json';

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
const textOpt: types.CommandOption[] = [{
    type: COMMAND_OPTION_TYPES.STRING,
    name: 'text',
    description: 'The text to which to apply the effect.',
    required: true
}];

/*
{ name: 'big', value: '🇧\u200B🇮\u200B🇬' },
            { name: 'box-outline', value: '🄱🄾🅇' },
            { name: 'box', value: '🅱🅾🆇' },
            { name: 'bubble', value: '🅑🅤🅑🅑🅛🅔' },
            { name: 'bubble-outline', value: 'ⓑⓘⓖ-ⓑⓤⓑⓑⓛⓔ' },
            { name: 'fancy', value: '𝒻𝒶𝓃𝒸𝓎' },
            { name: 'flip', value: 'dᴉlⅎ' },
            { name: 'fullwidth', value: 'ｆｕｌｌｗｉｄｔｈ' },
            { name: 'gothic', value: '𝔤𝔬𝔱𝔥𝔦𝔠' },
            { name: 'reverse', value: '🔀 reverse' },
            { name: 'smallcaps', value: 'sᴍᴀʟʟᴄᴀᴘs' },
            { name: 'subscript', value: 'ₛᵤᵦₛcᵣᵢₚₜ' },
            { name: 'superscript', value: 'ˢᵘᵖᵉʳˢᶜʳⁱᵖᵗ' }
            */

export default class TextCommand extends CommandUtils implements ICommand {
    constructor(bot: Bot) {
        super(bot, path.parse(__filename).name);
    }
    
    readonly dm_permission: boolean = true;
    readonly description = 'Apply effects to text.';
    readonly options: types.CommandOption[] = [{
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,
        name: 'big',
        description: 'Converts text to 🇪\u200B🇲\u200B🇴\u200B🇯\u200B🇮\u200B🇸.',
        options: textOpt
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,
        name: 'box',
        description: 'Converts text to 🅱🅾🆇🅴🅳 letters.',
        options: textOpt
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,
        name: 'box-outline',
        description: 'Converts text to 🄱🄾🅇🄴🄳 letters.',
        options: textOpt
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,
        name: 'bubble',
        description: 'Converts text to 🅑🅤🅑🅑🅛🅔 letters.',
        options: textOpt
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,
        name: 'bubble-outline',
        description: 'Converts text to ⓑⓤⓑⓑⓛⓔ letters.',
        options: textOpt
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,
        name: 'fancy',
        description: 'Converts text to 𝒻𝒶𝓃𝒸𝓎 letters.',
        options: textOpt
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,
        name: 'flip',
        description: 'Flips text (ノಠ _ ಠ)ノ︵ uʍop ǝpᴉsdn',
        options: textOpt
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,
        name: 'fullwidth',
        description: 'Converts text to ｆｕｌｌｗｉｄｔｈ characters.',
        options: textOpt
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,
        name: 'gothic',
        description: 'Converts text to 𝔤𝔬𝔱𝔥𝔦𝔠 letters.',
        options: textOpt
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,
        name: 'reverse',
        description: 'Reverses text 🔀 txet sesreveR',
        options: textOpt
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,
        name: 'smallcaps',
        description: 'Converts text to sᴍᴀʟʟᴄᴀᴘs.',
        options: textOpt
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,
        name: 'subscript',
        description: 'Converts text to ₛᵤᵦₛcᵣᵢₚₜ.',
        options: textOpt
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,
        name: 'superscript',
        description: 'Converts text to ˢᵘᵖᵉʳˢᶜʳⁱᵖᵗ.',
        options: textOpt
    }];

    async run(interaction: types.Interaction): types.CommandResponse {
        const effect = interaction.data?.options?.[0]?.name;
        let text = interaction.data?.options?.[0]?.options?.[0]?.value;
        if (!effect || !text || typeof text !== 'string') {
            this.bot.logger.handleError('COMMAND FAILED: /text', 'No arguments supplied [Should never happen...]');
            return null;
        }
        if (effect === 'flip' || effect === 'reverse') {
            text = Array.from(text).reverse().join('');
            if (effect === 'reverse') {
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
            return this.respond(interaction, '⚠ Text is too long!');
        }
        return this.respond(interaction, newText);
    }
}