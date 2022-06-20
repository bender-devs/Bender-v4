import { ICommand, CommandUtils } from '../structures/command';
import Bot from '../structures/bot';
import { CommandOption, CommandResponse, Interaction } from '../types/types';
import { COMMAND_OPTION_TYPES } from '../types/numberTypes';
import { createHash } from 'crypto';
import LangUtils from '../utils/language';

const encodeDecodeMode: CommandOption[] = [{
    type: COMMAND_OPTION_TYPES.STRING,

    name: LangUtils.get('CONVERT_TEXT_OPTION_MODE'),
    name_localizations: LangUtils.getLocalizationMap('CONVERT_TEXT_OPTION_MODE'),

    description: LangUtils.get('CONVERT_TEXT_OPTION_MODE_DESCRIPTION'),
    description_localizations: LangUtils.getLocalizationMap('CONVERT_TEXT_OPTION_MODE_DESCRIPTION'),

    choices: [{
        name: LangUtils.get('CONVERT_TEXT_OPTION_MODE_ENCODE'),
        name_localizations: LangUtils.getLocalizationMap('CONVERT_TEXT_OPTION_MODE_ENCODE'),
        value: 'encode'
    }, {
        name: LangUtils.get('CONVERT_TEXT_OPTION_MODE_DECODE'),
        name_localizations: LangUtils.getLocalizationMap('CONVERT_TEXT_OPTION_MODE_DECODE'),
        value: 'decode'
    }],
    required: true
}, {
    type: COMMAND_OPTION_TYPES.STRING,

    name: LangUtils.get('CONVERT_TEXT_OPTION_TEXT'),
    name_localizations: LangUtils.getLocalizationMap('CONVERT_TEXT_OPTION_TEXT'),

    description: LangUtils.get('CONVERT_TEXT_OPTION_TEXT_DESCRIPTION'),
    description_localizations: LangUtils.getLocalizationMap('CONVERT_TEXT_OPTION_TEXT_DESCRIPTION'),

    required: true
}];

export default class ConvertTextCommand extends CommandUtils implements ICommand {
    constructor(bot: Bot) {
        super(bot, LangUtils.get('CONVERT_TEXT_NAME'));
    }
    readonly name_localizations = LangUtils.getLocalizationMap('CONVERT_TEXT_NAME');

    readonly description = LangUtils.get('CONVERT_TEXT_DESCRIPTION');
    readonly description_localizations = LangUtils.getLocalizationMap('CONVERT_TEXT_DESCRIPTION');

    readonly dm_permission: boolean = true;

    readonly options: CommandOption[] = [{
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,

        name: 'base64',
        name_localizations: LangUtils.getLocalizationMap('CONVERT_TEXT_SUBCOMMAND_BASE64'),

        description: LangUtils.get('CONVERT_TEXT_SUBCOMMAND_BASE64_DESCRIPTION'),
        description_localizations: LangUtils.getLocalizationMap('CONVERT_TEXT_SUBCOMMAND_BASE64_DESCRIPTION'),

        options: encodeDecodeMode
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,

        name: 'binary',
        name_localizations: LangUtils.getLocalizationMap('CONVERT_TEXT_SUBCOMMAND_BINARY'),

        description: LangUtils.get('CONVERT_TEXT_SUBCOMMAND_BINARY_DESCRIPTION'),
        description_localizations: LangUtils.getLocalizationMap('CONVERT_TEXT_SUBCOMMAND_BINARY_DESCRIPTION'),

        options: encodeDecodeMode
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,

        name: 'hash',
        name_localizations: LangUtils.getLocalizationMap('CONVERT_TEXT_SUBCOMMAND_HASH'),

        description: LangUtils.get('CONVERT_TEXT_SUBCOMMAND_HASH_DESCRIPTION'),
        description_localizations: LangUtils.getLocalizationMap('CONVERT_TEXT_SUBCOMMAND_HASH_DESCRIPTION'),

        options: [{
            type: COMMAND_OPTION_TYPES.STRING,

            name: 'algorithm',
            name_localizations: LangUtils.getLocalizationMap('CONVERT_TEXT_OPTION_ALGORITHM'),

            description: LangUtils.get('CONVERT_TEXT_OPTION_ALGORITHM_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('CONVERT_TEXT_OPTION_ALGORITHM_DESCRIPTION'),

            choices: [ // doesn't need translating
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
            name_localizations: LangUtils.getLocalizationMap('CONVERT_TEXT_OPTION_HASHTEXT'),

            description: LangUtils.get('CONVERT_TEXT_OPTION_HASHTEXT_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('CONVERT_TEXT_OPTION_HASHTEXT_DESCRIPTION'),

            required: true
        }]
    }];

    async run(interaction: Interaction): CommandResponse {
        const args = interaction.data?.options;
        const subcommand = args?.[0]?.name;
        const modeOrAlgorithm = args?.[0]?.options?.[0]?.value;
        const text = args?.[0]?.options?.[1]?.value;
        if (!subcommand || !modeOrAlgorithm || typeof modeOrAlgorithm !== 'string' || !text || typeof text !== 'string') {
            return this.handleUnexpectedError(interaction, 'ARGS_INCOMPLETE');
        }
        switch (subcommand) {
            case 'base64':
                return this.#base64(interaction, modeOrAlgorithm, text);
            case 'binary':
                return this.#binary(interaction, modeOrAlgorithm, text);
            case 'hash':
                return this.#hash(interaction, modeOrAlgorithm, text);
        }

        return this.handleUnexpectedError(interaction, 'INVALID_SUBCOMMAND');
    }

    #base64(interaction: Interaction, mode: string, text: string) {
        let result = '';
        if (mode === 'decode') {
            result = Buffer.from(text, 'base64').toString('utf8');
        } else {
            result = Buffer.from(text).toString('base64');
        }
        const modeMessage = LangUtils.get(`CONVERT_TEXT_${mode === 'decode' ? 'DE' : 'EN'}CODED_BASE64`, interaction.locale);
        if (Array.from(result).length + Array.from(modeMessage).length > 1993) {
            return this.respondKey(interaction, 'TEXT_TOO_LONG', 'WARNING');
        }
        return this.respond(interaction, `${modeMessage}\n\`\`\`${result}\`\`\``, 'LONG_TEXT');
    }

    #binary(interaction: Interaction, mode: string, text: string) {
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
        const modeMessage = LangUtils.get(`CONVERT_TEXT_${mode === 'decode' ? 'DE' : 'EN'}CODED_BINARY`, interaction.locale);
        if (Array.from(result).length + Array.from(modeMessage).length > 1993) {
            return this.respondKey(interaction, 'TEXT_TOO_LONG', 'WARNING');
        }
        return this.respond(interaction, `${modeMessage}\n\`\`\`${result}\`\`\``, 'LONG_TEXT');
    }

    #hash(interaction: Interaction, algorithm: string, text: string) {
        const hash = createHash(algorithm).update(text).digest('hex');
        const computedMsg = LangUtils.get('CONVERT_TEXT_COMPUTED_HASH', interaction.locale);
        return this.respond(interaction, `${computedMsg} \`${hash}\``, 'SHORT_TEXT');
    }
}
