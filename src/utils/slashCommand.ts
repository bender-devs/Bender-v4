import Client from '../structures/client';
import Command from '../structures/command';
import CommandArgs from '../structures/commandArgs';
import Interaction from '../structures/discord/interaction';

export default class SlashCommandHandler {
    client: Client;
    
    constructor(client: Client) {
        this.client = client;
    }

    checkPermissions(command: Command) {

    }

    runCommand(command: Command, args: CommandArgs) {

    }

    handleCommand(interaction: Interaction, command: Command) {
        if (!interaction.guild_id && command.guildOnly) {
            const permMessage = this.client.utils.language.getAndReplace('GUILD_ONLY', { command: command.name });
            return this.client.utils.commandResponse.sendInteractionResponse({
                type: 4,
                data: {
                    content: permMessage,
                    flags: 64
                }
            })
        }
    }
};