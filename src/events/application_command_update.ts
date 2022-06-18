import { EventHandler } from '../types/types';
import { CommandUpdateData, LowercaseEventName } from '../types/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class CommandUpdateHandler extends EventHandler<CommandUpdateData> {
    constructor(bot: Bot) {
        super(basename(__filename, '.js') as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: CommandUpdateData) => {
        if (eventData.application_id !== this.bot.user.id) {
            return; // don't cache commands for other bots
        }
        if (eventData.guild_id) {
            this.bot.cache.guildCommands.update(eventData.guild_id, eventData);
        } else {
            this.bot.cache.globalCommands.update(eventData);
        }
    }

    handler = (/*eventData: CommandUpdateData*/) => {
        // event unused for now
    }
}