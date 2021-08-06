import Command from '../structures/command';
import * as path from 'path';
import Bot from '../structures/bot';
import * as types from '../structures/types';

export default class PingCommand implements Command {
    bot: Bot;
    readonly name: string = path.parse(__filename).name;

    constructor (bot: Bot) {
        this.bot = bot;
    }

    static guildOnly = false;
    static global = true;

    static options = [{
        type: 3,
        name: 'type',
        description: 'Whether to measure roundtrip or API ping.',
        choices: ['api', 'roundtrip']
    }]

    run(args: types.CommandOption[]): types.RequestResponse<types.CommandResponse> {
        return
    }

    runText(argString: string): types.RequestResponse<types.CommandResponse> {

    }
}