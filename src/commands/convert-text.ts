import { ICommand, CommandUtils } from '../structures/command';
import * as path from 'path';
import Bot from '../structures/bot';
import * as types from '../data/types';
import { COMMAND_OPTION_TYPES } from '../data/numberTypes';
import * as crypto from 'crypto';

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
        const subcommand = interaction.data?.options?.[0]?.name;
        const modeOrAlgorithm = interaction.data?.options?.[0]?.options?.[0]?.value;
        const textOrKey = interaction.data?.options?.[0]?.options?.[1]?.value;
        if (!subcommand || !modeOrAlgorithm || typeof modeOrAlgorithm !== 'string' || !textOrKey || typeof textOrKey !== 'string') {
            this.bot.logger.handleError('COMMAND FAILED: /convert-text', 'Not all arguments supplied [Should never happen...]');
            return null;
        }
        switch (subcommand) {
            case 'base64':
                return this.#base64(interaction, modeOrAlgorithm, textOrKey);
            case 'binary':
                return this.#binary(interaction, modeOrAlgorithm, textOrKey);
            case 'hash':
                return this.#hash(interaction, modeOrAlgorithm, textOrKey);
        }

        this.bot.logger.handleError('COMMAND FAILED: /convert-text', 'Invalid subcommand [Should never happen...]');
            return null;
    }

    #base64(interaction: types.Interaction, mode: string, text: string) {
        let result = '', op = '';
        if (mode === 'decode') {
            result = Buffer.from(text, 'base64').toString('utf8');
            op = 'De';
        } else if (mode === 'encode') {
            result = Buffer.from(text).toString('base64');
            op = 'En';
        } else {
            this.bot.logger.handleError('COMMAND FAILED: /convert-text', 'Invalid base64 mode [Should never happen...]');
            return null;
        }
        if (Array.from(result).length > 1975) {
            return this.respond(interaction, `⚠ Text is too long!`);
        }
        return this.respond(interaction, `📃 ${op}coded base64:\n\`\`\`${result}\`\`\``);
    }

    #binary(interaction: types.Interaction, mode: string, text: string) {
        let result = '', op = '';
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
            op = 'De';
        } else if (mode === 'encode') {
            const resArr = Array.from(text).map(item => item.codePointAt(0)?.toString(2));
            for (const block of resArr) {
                if (!block) {
                    continue;
                }
                result += block.padStart(block.length > 8 ? 16 : 8, '0') + ' ';
            }
            result = result.trim();
            op = 'En';
        } else {
            this.bot.logger.handleError('COMMAND FAILED: /convert-text', 'Invalid binary mode [Should never happen...]');
            return null;
        }
        if (Array.from(result).length > 1975) {
            return this.respond(interaction, `⚠ Text is too long!`);
        }
        return this.respond(interaction, `📃 ${op}coded binary:\n\`\`\`${result}\`\`\``);
    }

    #hash(interaction: types.Interaction, algorithm: string, text: string) {
        const hasher = crypto.createHash(algorithm);
        hasher.update(text);
        const result = hasher.digest('hex');
        return this.respond(interaction, `🗒 Computed hash: \`${result}\``);
    }
}