import { EventHandler } from '../data/types';
import { InteractionCreateData, LowercaseEventName } from '../data/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';
import { INTERACTION_REQUEST_TYPES } from '../data/numberTypes';

export default class InteractionCreateHandler extends EventHandler<InteractionCreateData> {
    constructor(bot: Bot) {
        super(basename(__filename, '.js') as LowercaseEventName, bot);
    }

    cacheHandler = (/*eventData: InteractionCreateData*/) => {
        // TODO: cache interactions?
    }

    handler = (eventData: InteractionCreateData) => {
        if (eventData.type === INTERACTION_REQUEST_TYPES.APPLICATION_COMMAND) {
            const name = eventData.data?.name;
            if (!name) {
                // this should never happen
                return null;
            }
            // TODO: guild (custom) commands
            const cmd = this.bot.commandManager.commands.find(command => command.name === name);
            if (cmd) {
                this.bot.logger.debug('INTERACTION', 'Received command: /' + name);
                if (eventData.data?.options) {
                    this.bot.logger.debug('INTERACTION', 'Command options: ', eventData.data.options);
                }
                return this.bot.commandHandler.handleCommand(eventData, cmd);
            } else {
                this.bot.logger.debug('INTERACTION', 'Command not found: /' + name);
            }
        }
    }
}