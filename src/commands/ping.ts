import Command from '../structures/command';
import * as path from 'path';
import Client from '../structures/client';

export default class PingCommand implements Command {
    client: Client;
    readonly name: string = path.parse(__filename).name;

    constructor (client: Client) {
        this.client = client;
    }

    static guildOnly = false;
    static global = true;

    static options = [{
        type: 3,
        name: 'type',
        description: 'Whether to measure roundtrip or API ping.',
        choices: ['api', 'roundtrip']
    }]

    run(args: CommandOption[]) {

    }

    runText(argString: string) {

    }
}