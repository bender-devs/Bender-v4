import Client from './client';

export default interface Command {
    name: string;
    client: Client;
    guildOnly: boolean;
}