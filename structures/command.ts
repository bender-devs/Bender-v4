import Client from './client';

export default class Command {
    name: string;
    client: Client;

    constructor(client) {
        this.client = client;
    }

    getAPIFormat() {
        return {
            name: this.name
        }
    }
}