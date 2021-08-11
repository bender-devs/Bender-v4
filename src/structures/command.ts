import Bot from './bot';
import * as types from './types';

export default interface Command {
    name: string;
    bot: Bot;
    guildOnly: boolean;
    global: boolean; // whether this is a top-level/global slash command
    options?: types.CommandOption[];
    default_permission: boolean;

    run(interaction: types.Interaction, args: types.CommandOption[]): types.RequestResponse<types.CommandResponse>;
    runText(msg: types.Message, argString: string): types.RequestResponse<types.CommandResponse>;
}