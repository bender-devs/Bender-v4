import { EventHandler } from '../types/types';
import { InteractionCreateData, LowercaseEventName } from '../types/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';
import { INTERACTION_REQUEST_TYPES } from '../types/numberTypes';
import { inspect } from 'util';
import { DEV_SERVER } from '../data/constants';

export default class InteractionCreateHandler extends EventHandler<InteractionCreateData> {
    constructor(bot: Bot) {
        super(basename(__filename, '.js') as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: InteractionCreateData) => {
        if (eventData.guild_id && eventData.member) {
            this.bot.cache.members.set(eventData.guild_id, eventData.member);
        }
        if (eventData.user) {
            this.bot.cache.users.set(eventData.user);
        }
        // TODO: cache interactions?
    }

    handler = (eventData: InteractionCreateData) => {
        if (eventData.type === INTERACTION_REQUEST_TYPES.APPLICATION_COMMAND) {
            const name = eventData.data?.name;
            if (!name) {
                // this should never happen
                return null;
            }
            if (eventData.guild_id === DEV_SERVER) {
                const devCmd = this.bot.commandManager.developer_commands.find(command => command.name === name);
                if (devCmd) {
                    this.bot.logger.debug('INTERACTION', `Received developer command: /${name}`);
                    if (eventData.data?.options) {
                        this.bot.logger.debug('INTERACTION', 'Command options:', inspect(eventData.data.options, false, 69, true));
                    }
                    return devCmd.run(eventData).catch(err => {
                        return this.bot.logger.handleError(`COMMAND FAILED: /${name}`, err);
                    });
                }
            }
            if (eventData.guild_id) {
                // TODO: check db for guild (custom) commands
                //this.bot.logger.debug('INTERACTION', `Guild command not found: /${name} [Guild ID: ${eventData.guild_id}]`);
            }
            if (eventData.data?.target_id) {
                const resolvedUsers = eventData.data.resolved?.users && Object.keys(eventData.data.resolved.users).length;
                if (resolvedUsers) {
                    const userCommand = this.bot.commandManager.user_commands.find(command => command.name === name);
                    if (userCommand) {
                        this.bot.logger.debug('INTERACTION', `Received user command: ${name} | User ID: ${eventData.data.target_id}`);
                        return userCommand.run(eventData);
                    } else {
                        this.bot.logger.debug('INTERACTION', `User command not found: ${name}`);
                        return null;
                    }
                }
                const resolvedMessages = eventData.data.resolved?.messages && Object.keys(eventData.data.resolved.messages).length;
                if (resolvedMessages) {
                    const msgCommand = this.bot.commandManager.message_commands.find(command => command.name === name);
                    if (msgCommand) {
                        this.bot.logger.debug('INTERACTION', `Received message command: ${name} | Message ID: ${eventData.data.target_id}`);
                        return msgCommand.run(eventData);
                    } else {
                        this.bot.logger.debug('INTERACTION', `Message command not found: ${name}`);
                        return null;
                    }
                }
                this.bot.logger.debug('INTERACTION', `Unknown command type: ${name} | Target ID: ${eventData.data.target_id}`);
                return null;
            }
            const cmd = this.bot.commandManager.commands.find(command => command.name === name);
            if (cmd) {
                this.bot.logger.debug('INTERACTION', `Received command: /${name}`);
                if (eventData.data?.options) {
                    this.bot.logger.debug('INTERACTION', 'Command options: ', inspect(eventData.data.options, false, 69, true));
                }
                return cmd.run(eventData).catch(err => {
                    return this.bot.logger.handleError(`COMMAND FAILED: /${name}`, err);
                });
            } else {
                this.bot.logger.debug('INTERACTION', `Command not found: /${name}`);
            }
        }
    }
}