import Client from './client';
import * as types from './types';

export default interface Command {
    name: string;
    client: Client;
    guildOnly: boolean;
    global: boolean; // whether this is a top-level/global slash command
    options?: types.CommandOption[];
    default_permission: boolean;

    run(args: types.CommandOption[]): types.RequestResponse<>;
    runText(argString: string): types.RequestResponse<>;
}