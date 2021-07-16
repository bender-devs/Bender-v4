import Command from '../structures/command';
import path from 'path';

export default class PingCommand extends Command {
    name: string;

    constructor (client) {
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