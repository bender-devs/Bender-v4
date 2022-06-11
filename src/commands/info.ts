import { ICommand, CommandUtils } from '../structures/command';
import * as path from 'path';
import Bot from '../structures/bot';
import * as types from '../data/types';
import { COMMAND_OPTION_TYPES } from '../data/numberTypes';

import userInfoSubcommand from './info/userinfo';

export default class InfoCommand extends CommandUtils implements ICommand {
    constructor(bot: Bot) {
        super(bot, path.parse(__filename).name);
    }
    
    readonly dm_permission: boolean = true;
    readonly description = 'Show information about a user, ';
    readonly options: types.CommandOption[] = [{
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,
        name: 'user',
        description: 'Show information about a server member or user.',
        options: [{
            type: COMMAND_OPTION_TYPES.USER,
            name: 'user',
            description: 'The user or member to show info about.',
            required: true
        }]
    }];

    run(interaction: types.Interaction): types.CommandResponse {
        const args = interaction.data?.options;
        const subcommand = args?.[0]?.name;
        const target = args?.[0]?.options?.[0]?.value;
        switch (subcommand) {
            case 'user':
                return userInfoSubcommand.bind(this)(interaction, target);
        }
        return this.handleUnexpectedError(interaction, 'ARGS_INCOMPLETE');
    }
}