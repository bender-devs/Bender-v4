import type Bot from '../structures/bot.js';
import type { CommandUpdateData } from '../types/gatewayTypes.js';
import { EventHandler } from '../types/types.js';

export default class CommandDeleteHandler extends EventHandler<CommandUpdateData> {
    constructor(bot: Bot) {
        super('application_command_delete', bot);
    }

    cacheHandler = (eventData: CommandUpdateData) => {
        if (eventData.application_id !== this.bot.user.id) {
            return; // don't cache commands for other bots
        }
        if (eventData.guild_id) {
            this.bot.cache.guildCommands.delete(eventData.guild_id, eventData.id);
        } else {
            this.bot.cache.globalCommands.delete(eventData.id);
        }
    };

    handler = (/*eventData: CommandUpdateData*/) => {
        // event unused for now
    };
}
