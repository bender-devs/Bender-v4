import { ICommand, CommandUtils } from '../structures/command';
import * as path from 'path';
import Bot from '../structures/bot';
import * as types from '../data/types';
import { COMMAND_OPTION_TYPES } from '../data/numberTypes';
import * as crypto from 'crypto';
import LanguageUtils from '../utils/language';

const encodeDecodeMode: types.CommandOption[] = [{
    type: COMMAND_OPTION_TYPES.STRING,
    name: 'mode',
    description: 'Choose encode or decode mode.',
    choices: [
        { name: 'Encode', value: 'encode' },
        { name: 'Decode', value: 'decode' }
    ],
    required: true
}, {
    type: COMMAND_OPTION_TYPES.STRING,
    name: 'text',
    description: 'The text to encode or decode.',
    required: true
}];

export default class ConvertTextCommand extends CommandUtils implements ICommand {
    constructor(bot: Bot) {
        super(bot, path.parse(__filename).name);
    }

    readonly dm_permission: boolean = true;
    readonly description = 'Convert text between formats.';
    readonly options: types.CommandOption[] = [{
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,
        name: 'base64',
        description: 'Encodes or decodes text in base64.',
        options: encodeDecodeMode
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,
        name: 'binary',
        description: 'Encodes or decodes text in binary.',
        options: encodeDecodeMode
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,
        name: 'hash',
        description: 'Runs text through a hashing algorithm.',
        options: [{
            type: COMMAND_OPTION_TYPES.STRING,
            name: 'algorithm',
            description: 'The hashing algorithm to use.',
            choices: [
                { name: 'MD5', value: 'md5' },
                { name: 'SHA-1', value: 'sha1' },
                { name: 'SHA-256', value: 'sha256' },
                { name: 'SHA-512', value: 'sha512' },
                { name: 'SHA3-256', value: 'sha3-256' },
                { name: 'SHA3-512', value: 'sha3-512' }
            ],
            required: true
        }, {
            type: COMMAND_OPTION_TYPES.STRING,
            name: 'text',
            description: 'The text to hash.',
            required: true
        }]
    }];

    async run(interaction: types.Interaction): types.CommandResponse {
        const args = interaction.data?.options;
        const subcommand = args?.[0]?.name;
        const modeOrAlgorithm = args?.[0]?.options?.[0]?.value;
        const textOrKey = args?.[0]?.options?.[1]?.value;
        if (!subcommand || !modeOrAlgorithm || typeof modeOrAlgorithm !== 'string' || !textOrKey || typeof textOrKey !== 'string') {
            return this.handleUnexpectedError(interaction, 'ARGS_INCOMPLETE');
        }
        switch (subcommand) {
            case 'base64':
                return this.#base64(interaction, modeOrAlgorithm, textOrKey);
            case 'binary':
                return this.#binary(interaction, modeOrAlgorithm, textOrKey);
            case 'hash':
                return this.#hash(interaction, modeOrAlgorithm, textOrKey);
        }

        return this.handleUnexpectedError(interaction, 'INVALID_SUBCOMMAND');
    }

    #base64(interaction: types.Interaction, mode: string, text: string) {
        let result = '';
        if (mode === 'decode') {
            result = Buffer.from(text, 'base64').toString('utf8');
        } else {
            result = Buffer.from(text).toString('base64');
        }
        const modeMessage = LanguageUtils.getAndReplace(mode === 'decode' ? 'DECODED_BASE64' : 'ENCODED_BASE64', {}, interaction.locale);
        if (Array.from(result).length + Array.from(modeMessage).length > 1989) {
            const lengthMsg = LanguageUtils.getAndReplace('TEXT_TOO_LONG', {}, interaction.locale);
            return this.respond(interaction, lengthMsg);
        }
        return this.respond(interaction, `📃 ${modeMessage}:\n\`\`\`${result}\`\`\``);
    }

    #binary(interaction: types.Interaction, mode: string, text: string) {
        let result = '';
        if (mode === 'decode') {
            let binaryPieces = text.split(' '), validPieceLength = true;
            for (const piece of binaryPieces) {
                if (piece.length > 8) {
                    validPieceLength = false;
                    break;
                }
            }
            if (!validPieceLength) {
                text = binaryPieces.join();
                // because the global flag is set, a standard array is returned and it's safe to use 'as'
                binaryPieces = text.match(/.{1,8}/g) as Array<string>;
            }
            result = binaryPieces.map(item => String.fromCodePoint(parseInt(item, 2))).join('');
        } else {
            const resArr = Array.from(text).map(item => item.codePointAt(0)?.toString(2));
            for (const block of resArr) {
                if (!block) {
                    continue;
                }
                result += block.padStart(block.length > 8 ? 16 : 8, '0') + ' ';
            }
            result = result.trim();
        }
        const modeMessage = LanguageUtils.getAndReplace(mode === 'decode' ? 'DECODED_BINARY' : 'ENCODED_BINARY', {}, interaction.locale);
        if (Array.from(result).length + Array.from(modeMessage).length > 1989) {
            const lengthMsg = LanguageUtils.getAndReplace('TEXT_TOO_LONG', {}, interaction.locale);
            return this.respond(interaction, lengthMsg);
        }
        return this.respond(interaction, `📃 ${modeMessage}:\n\`\`\`${result}\`\`\``);
    }

    #hash(interaction: types.Interaction, algorithm: string, text: string) {
        const hasher = crypto.createHash(algorithm);
        hasher.update(text);
        const result = hasher.digest('hex');
        const computedMsg = LanguageUtils.getAndReplace('COMPUTED_HASH', {}, interaction.locale);
        return this.respond(interaction, `🗒 ${computedMsg}: \`${result}\``);
    }
}
