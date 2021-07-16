import Client from '../structures/client';
import Command from '../structures/command';

export default class TextCommandHandler {
    client: Client;

    constructor (client: Client) {
        this.client = client;
    }

    parseCommand(input: string[]) {

    }
    parseArgs(command: Command, argString: string[]) {

    }
    checkPermissions(command: Command, message) {
        
    }
    handleEdit(command: Command, message, oldMessage) {

    }
    runCommand(command: Command, args: string[]) {

    }
}