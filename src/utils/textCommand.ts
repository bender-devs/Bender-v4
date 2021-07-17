import Client from '../structures/client';
import Command from '../structures/command';
import CommandArgs from '../structures/commandArgs';
import Message from '../structures/discord/message';

export default class TextCommandHandler {
    client: Client;

    constructor (client: Client) {
        this.client = client;
    }

    parseCommand(input: string) {

    }
    parseArgs(command: Command, argString: string) {

    }
    checkPermissions(command: Command, message: Message) {
        
    }
    handleEdit(command: Command, message: Message, oldMessage: Message) {

    }
    runCommand(command: Command, args: CommandArgs) {

    }
}

module.exports = TextCommandHandler;