import { EventHandler } from '../data/types';
import { InteractionCreateData, LowercaseEventName } from '../data/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';
import { INTERACTION_REQUEST_TYPES } from '../data/numberTypes';
import { inspect } from 'util';

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
            if (eventData.guild_id) {
                const devCmd = this.bot.commandManager.developer_commands.find(command => command.name === name);
                if (devCmd) {
                    this.bot.logger.debug('INTERACTION', 'Received developer command: /' + name);
                    if (eventData.data?.options) {
                        this.bot.logger.debug('INTERACTION', 'Command options: ', inspect(eventData.data.options, false, 69));
                    }
                    return devCmd.run(eventData);
                }
                // TODO: check db for guild (custom) commands
                this.bot.logger.debug('INTERACTION', `Guild command not found: /${name} [Guild ID: ${eventData.guild_id}]`);
            }
            const cmd = this.bot.commandManager.commands.find(command => command.name === name);
            if (cmd) {
                this.bot.logger.debug('INTERACTION', 'Received command: /' + name);
                if (eventData.data?.options) {
                    this.bot.logger.debug('INTERACTION', 'Command options: ', inspect(eventData.data.options, false, 69));
                }
                return cmd.run(eventData);
            } else {
                this.bot.logger.debug('INTERACTION', 'Command not found: /' + name);
            }
        }
    }
}