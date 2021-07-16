import Client from '../structures/client';

export default class SlashCommandHandler {
    client: Client;
    
    constructor(client) {
        this.client = client;
    }

    checkPermissions(command) {

    }

    runCommand(command, args) {

    }

    handleCommand(interaction, command) {
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