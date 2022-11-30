import { ICommand, CommandUtils } from '../structures/command';
import Bot from '../structures/bot';
import { CommandOption, CommandResponse, Interaction } from '../types/types';
import { COMMAND_OPTION_TYPES } from '../types/numberTypes';
import LangUtils from '../utils/language';

import eightBall from './fun/8ball';
import coinflip from './fun/coinflip';
import dice from './fun/dice';
import rps from './fun/rps';
import choose from './fun/choose';

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
            type: COMMAND_OPTION_TYPES.INTEGER,

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
            type: COMMAND_OPTION_TYPES.INTEGER,

            name: LangUtils.get('FUN_DICE_OPTION_COUNT'),
            name_localizations: LangUtils.getLocalizationMap('FUN_DICE_OPTION_COUNT'),

            description: LangUtils.get('FUN_DICE_OPTION_COUNT_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('FUN_DICE_OPTION_COUNT_DESCRIPTION'),

            min_value: 1,
            max_value: 100
        }, {
            type: COMMAND_OPTION_TYPES.INTEGER,

            name: LangUtils.get('FUN_DICE_OPTION_SIDES'),
            name_localizations: LangUtils.getLocalizationMap('FUN_DICE_OPTION_SIDES'),

            description: LangUtils.get('FUN_DICE_OPTION_SIDES_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('FUN_DICE_OPTION_SIDES_DESCRIPTION'),

            min_value: 3,
            max_value: 20
        }]
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,

        name: 'rps',
        name_localizations: LangUtils.getLocalizationMap('FUN_RPS_SUBCOMMAND'),

        description: LangUtils.get('FUN_RPS_SUBCOMMAND_DESCRIPTION'),
        description_localizations: LangUtils.getLocalizationMap('FUN_RPS_SUBCOMMAND_DESCRIPTION'),

        options: [{
            type: COMMAND_OPTION_TYPES.STRING,

            name: LangUtils.get('FUN_RPS_OPTION'),
            name_localizations: LangUtils.getLocalizationMap('FUN_RPS_OPTION'),

            description: LangUtils.get('FUN_RPS_OPTION_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('FUN_RPS_OPTION_DESCRIPTION'),

            choices: [{
                name: LangUtils.get('FUN_RPS_ROCK'),
                name_localizations: LangUtils.getLocalizationMap('FUN_RPS_ROCK'),
                value: 'r'
            }, {
                name: LangUtils.get('FUN_RPS_PAPER'),
                name_localizations: LangUtils.getLocalizationMap('FUN_RPS_PAPER'),
                value: 'p'
            }, {
                name: LangUtils.get('FUN_RPS_SCISSORS'),
                name_localizations: LangUtils.getLocalizationMap('FUN_RPS_SCISSORS'),
                value: 's'
            }]
        }]
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,

        name: 'choose',
        name_localizations: LangUtils.getLocalizationMap('FUN_CHOOSE_SUBCOMMAND'),

        description: LangUtils.get('FUN_CHOOSE_SUBCOMMAND_DESCRIPTION'),
        description_localizations: LangUtils.getLocalizationMap('FUN_CHOOSE_SUBCOMMAND_DESCRIPTION'),

        options: [{
            type: COMMAND_OPTION_TYPES.STRING,

            name: LangUtils.get('FUN_CHOOSE_OPTION'),
            name_localizations: LangUtils.getLocalizationMap('FUN_CHOOSE_OPTION'),

            description: LangUtils.get('FUN_CHOOSE_OPTION_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('FUN_CHOOSE_OPTION_DESCRIPTION'),

            required: true
        }]
    }];

    run(interaction: Interaction): CommandResponse {
        const args = interaction.data?.options;
        const subcommand = args?.[0]?.name;
        const firstArg = args?.[0]?.options?.[0]?.value;
        switch (subcommand) {
            case '8ball':
                return eightBall.bind(this)(interaction);
            case 'coinflip':
                return coinflip.bind(this)(interaction, firstArg);
            case 'dice': {
                const numDice = args?.[0]?.options?.find(opt => opt.name === LangUtils.get('FUN_DICE_OPTION_COUNT'))?.value;
                const numSides = args?.[0]?.options?.find(opt => opt.name === LangUtils.get('FUN_DICE_OPTION_SIDES'))?.value;
                return dice.bind(this)(interaction, numDice, numSides);
            }
            case 'rps':
                return rps.bind(this)(interaction, firstArg);
            case 'choose':
                return choose.bind(this)(interaction, firstArg);
        }
        return this.handleUnexpectedError(interaction, 'INVALID_SUBCOMMAND');
    }
}