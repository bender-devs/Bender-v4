import Command from '../structures/command';
import * as path from 'path';
import Client from '../structures/client';

export default class PingCommand extends Command {
    name: string;

    constructor (client: Client) {
        super(client);
        this.name = path.parse(__filename).name;
    }

    static options = [{
        type: 3,
        name: 'type',
        description: 'Whether to measure roundtrip or API ping.',
        choices: ['api', 'roundtrip']
    }]

    static guildOnly = false

    static showLoading = false

    run(args) {

    }
}