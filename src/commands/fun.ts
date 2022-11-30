import { ICommand, CommandUtils } from '../structures/command';
import Bot from '../structures/bot';
import { CommandOption, CommandResponse, Interaction } from '../types/types';
import { COMMAND_OPTION_TYPES } from '../types/numberTypes';
import LangUtils from '../utils/language';

import eightBall from './fun/8ball';
import coinflip from './fun/coinflip';
import dice from './fun/dice';

export default class FunCommand extends CommandUtils implements ICommand {
    constructor(bot: Bot) {
        super(bot, LangUtils.get('FUN_NAME'));
    }
    readonly name_localizations = LangUtils.getLocalizationMap('FUN_NAME');

    readonly description = LangUtils.get('FUN_DESCRIPTION');
    readonly description_localizations = LangUtils.getLocalizationMap('FUN_DESCRIPTION');

    readonly dm_permission: boolean = true;

    readonly options: CommandOption[] = [{
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,

        name: '8ball',
        name_localizations: LangUtils.getLocalizationMap('FUN_8BALL_SUBCOMMAND'),

        description: LangUtils.get('FUN_8BALL_SUBCOMMAND_DESCRIPTION'),
        description_localizations: LangUtils.getLocalizationMap('FUN_8BALL_SUBCOMMAND_DESCRIPTION'),

        options: [{
            type: COMMAND_OPTION_TYPES.STRING,

            name: LangUtils.get('FUN_8BALL_OPTION'),
            name_localizations: LangUtils.getLocalizationMap('FUN_8BALL_OPTION'),

            description: LangUtils.get('FUN_8BALL_OPTION_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('FUN_8BALL_OPTION_DESCRIPTION'),

            required: true
        }]
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,

        name: 'coinflip',
        name_localizations: LangUtils.getLocalizationMap('FUN_COIN_SUBCOMMAND'),

        description: LangUtils.get('FUN_COIN_SUBCOMMAND_DESCRIPTION'),
        description_localizations: LangUtils.getLocalizationMap('FUN_COIN_SUBCOMMAND_DESCRIPTION'),

        options: [{
            type: COMMAND_OPTION_TYPES.NUMBER,

            name: LangUtils.get('FUN_COIN_OPTION'),
            name_localizations: LangUtils.getLocalizationMap('FUN_COIN_OPTION'),

            description: LangUtils.get('FUN_COIN_OPTION_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('FUN_COIN_OPTION_DESCRIPTION'),

            min_value: 1,
            max_value: 10000
        }]
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,

        name: 'dice',
        name_localizations: LangUtils.getLocalizationMap('FUN_DICE_SUBCOMMAND'),

        description: LangUtils.get('FUN_DICE_SUBCOMMAND_DESCRIPTION'),
        description_localizations: LangUtils.getLocalizationMap('FUN_DICE_SUBCOMMAND_DESCRIPTION'),

        options: [{
            type: COMMAND_OPTION_TYPES.NUMBER,

            name: LangUtils.get('FUN_DICE_OPTION_COUNT'),
            name_localizations: LangUtils.getLocalizationMap('FUN_DICE_OPTION_COUNT'),

            description: LangUtils.get('FUN_DICE_OPTION_COUNT_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('FUN_DICE_OPTION_COUNT_DESCRIPTION'),

            min_value: 1,
            max_value: 100
        }, {
            type: COMMAND_OPTION_TYPES.NUMBER,

            name: LangUtils.get('FUN_DICE_OPTION_SIDES'),
            name_localizations: LangUtils.getLocalizationMap('FUN_DICE_OPTION_SIDES'),

            description: LangUtils.get('FUN_DICE_OPTION_SIDES_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('FUN_DICE_OPTION_SIDES_DESCRIPTION'),

            min_value: 3,
            max_value: 20
        }]
    }];

    run(interaction: Interaction): CommandResponse {
        const args = interaction.data?.options;
        const subcommand = args?.[0]?.name;
        switch (subcommand) {
            case '8ball':
                return eightBall.bind(this)(interaction);
            case 'coinflip': {
                const numCoins = args?.[0]?.options?.[0]?.value;
                return coinflip.bind(this)(interaction, numCoins);
            }
            case 'dice': {
                const numDice = args?.[0]?.options?.find(opt => opt.name === LangUtils.get('FUN_DICE_OPTION_COUNT'))?.value;
                const numSides = args?.[0]?.options?.find(opt => opt.name === LangUtils.get('FUN_DICE_OPTION_SIDES'))?.value;
                return dice.bind(this)(interaction, numDice, numSides);
            }
        }
        return this.handleUnexpectedError(interaction, 'INVALID_SUBCOMMAND');
    }
}