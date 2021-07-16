import Client from './client';

export default class Command {
    name: string;
    client: Client;

    constructor(client: Client) {
        this.name = name;
        this.client = client;
    }

    getAPIFormat() {
        return {
            name: this.name
        }
    }
}