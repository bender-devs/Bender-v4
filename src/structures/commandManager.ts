import Bot from './bot';
import { ICommand, MessageCommand, UserCommand, UserOrMessageCommand } from './command';
import { DEV_SERVER } from '../data/constants';
import { Snowflake } from '../types/types';
import { COMPARE_COMMANDS_KEYS, DatabaseResult, SavedCommand } from '../types/dbTypes';
import { COMMAND_TYPES } from '../types/numberTypes';

import PingCommand from '../commands/ping';
import TextCommand from '../commands/text';
import ConvertTextCommand from '../commands/convert-text';
import InfoCommand from '../commands/info';
import FunCommand from '../commands/fun';

import DevCommand from '../commands/dev';

import getUserCommands from '../commands/nonText/user';
import getMessageCommands from '../commands/nonText/message';

export default class SlashCommandManager {
    bot: Bot;
    commands: ICommand[];
    developer_commands: ICommand[];
    user_commands: UserCommand[];
    message_commands: MessageCommand[];

    constructor(bot: Bot) {
        this.bot = bot;

        this.commands = [];
        this.commands.push(new PingCommand(this.bot));
        this.commands.push(new TextCommand(this.bot));
        this.commands.push(new ConvertTextCommand(this.bot));
        this.commands.push(new InfoCommand(this.bot));
        this.commands.push(new FunCommand(this.bot));

        this.developer_commands = [];
        this.developer_commands.push(new DevCommand(this.bot));

        this.user_commands = getUserCommands(this.bot);
        this.message_commands = getMessageCommands(/*this.bot*/);
    }

    async updateGlobalAndDevCommands() {
        await this.updateCommandList([...this.commands, ...this.user_commands]);
        await this.updateCommandList(this.developer_commands, DEV_SERVER);
    }

    async updateCommandList(commandList: (ICommand | UserOrMessageCommand)[], guildID?: Snowflake) {
        const listTypeInfo = `[${guildID ? `GUILD ${guildID}` : 'GLOBAL'}]`;
        this.bot.logger.debug('COMMAND MANAGER', listTypeInfo, 'Updating command list...');

        const currentCommands = await (guildID ? this.bot.db.guildCommand.list(guildID) : this.bot.db.command.list());
        if (!currentCommands.length) {
            await (guildID ? this.bot.api.guildCommand.replaceAll(guildID, commandList) : this.bot.api.command.replaceAll(commandList)).then(cmds => {
                return cmds ? (guildID ? this.bot.db.guildCommand.replaceAll(guildID, cmds) : this.bot.db.command.replaceAll(cmds)) : null;
            }).catch(error => this.bot.logger.handleError('COMMAND MANAGER', error, listTypeInfo));
            return true;
        }
        const newCommands: (ICommand | UserOrMessageCommand)[] = [];
        const editedCommands: Record<Snowflake, ICommand | UserOrMessageCommand> = {};
        const deletedCommands: SavedCommand[] = [];
        for (const command of currentCommands) {
            const loadedCommand = commandList.find(cmd => cmd.name === command.name);
            if (!loadedCommand) {
                deletedCommands.push(command);
            }
            else if (!this.#compareCommands(command, loadedCommand)) {
                editedCommands[command.id] = loadedCommand;
            }
        }
        for (const command of commandList) {
            if (currentCommands.find(cmd => cmd.name === command.name)) {
                continue;
            }
            if (deletedCommands.find(cmd => cmd.name === command.name)) {
                continue;
            }
            let id: Snowflake, foundEdited = false;
            for (id in editedCommands) {
                if (editedCommands[id].name === command.name) {
                    foundEdited = true;
                    break;
                }
            }
            if (foundEdited) {
                continue;
            }
            newCommands.push(command);
        }
        if (!newCommands.length && !Object.keys(editedCommands).length && !deletedCommands.length) {
            this.bot.logger.debug('COMMAND MANAGER', listTypeInfo, 'No command changes detected.');
        }
        if (newCommands.length) {
            this.bot.logger.debug('COMMAND MANAGER', listTypeInfo, 'New commands:', newCommands.map(cmd => cmd.name));
            await Promise.all(newCommands.map(this.#stripBotValue).map(cmd => guildID ?
                this.bot.api.guildCommand.create(guildID, cmd).then(command => command ? this.bot.db.guildCommand.create(guildID, command) : null) :
                this.bot.api.command.create(cmd).then(command => command ? this.bot.db.command.create(command) : null)
            )).catch(error => this.bot.logger.handleError('COMMAND MANAGER', error, listTypeInfo));
        }
        if (Object.keys(editedCommands).length) {
            this.bot.logger.debug('COMMAND MANAGER', listTypeInfo, 'Updated commands:', Object.values(editedCommands).map(cmd => cmd.name));
            const promises: Promise<DatabaseResult | null>[] = [];
            let id: Snowflake;
            for (id in editedCommands) {
                const cmd = this.#stripBotValue(editedCommands[id]);
                promises.push(guildID ?
                    this.bot.api.guildCommand.edit(guildID, id, cmd).then(command => command ? this.bot.db.guildCommand.update(guildID, id, command) : null) :
                    this.bot.api.command.edit(id, cmd).then(command => command ? this.bot.db.command.update(id, command) : null)
                );
            }
            await Promise.all(promises).catch(error => this.bot.logger.handleError('COMMAND MANAGER', error, listTypeInfo));
        }
        if (deletedCommands.length) {
            this.bot.logger.debug('COMMAND MANAGER', listTypeInfo, 'Deleted commands:', deletedCommands.map(cmd => cmd.name));
            await Promise.all(deletedCommands.map(cmd => guildID ?
                this.bot.api.guildCommand.delete(guildID, cmd.id).then(() => this.bot.db.guildCommand.delete(guildID, cmd.id)) :
                this.bot.api.command.delete(cmd.id).then(() => this.bot.db.command.delete(cmd.id))
            )).catch(error => this.bot.logger.handleError('COMMAND MANAGER', error, listTypeInfo));
        }
        return true;
    }

    #stripBotValue(cmd: ICommand | UserOrMessageCommand) {
        if (cmd.type !== COMMAND_TYPES.CHAT_INPUT) {
            const newCmd: UserOrMessageCommand & {
                bot: never;
                description: never;
            } = Object.assign({}, cmd, { bot: undefined, description: undefined });
            delete newCmd.bot;
            delete newCmd.description;
            return newCmd;
        }
        const newCmd: ICommand & { bot: never } = Object.assign({}, cmd, { bot: undefined });
        delete newCmd.bot;
        return newCmd;
    }

    #isEqual<T>(value1: T, value2: T) {
        if (value1 === value2) {
            return true;
        }
        // consider null and undefined the same since Discord will sometimes convert between them internally
        if ((value1 === null && value2 === undefined) || (value1 === undefined && value2 === null)) {
            return true;
        }
        if (typeof value1 !== typeof value2 || Array.isArray(value1) !== Array.isArray(value2)) {
            return false;
        }
        if (Array.isArray(value1) && Array.isArray(value2)) {
            if (value1.length !== value2.length) {
                return false;
            }
            for (const index in value1) {
                if (!this.#isEqual(value1[index], value2[index])) {
                    return false;
                }
            }
            return true;
        }
        if (typeof value1 === 'object' && value1 !== null && typeof value2 === 'object' && value2 !== null) {
            // skip Object.keys() length and key list comparison, since we want to consider 'key: null' and the absence of a key (undefined) the same in this case
            const val1 = value1 as Record<string, unknown>;
            const val2 = value2 as Record<string, unknown>;
            for (const key of Object.keys(val1)) {
                if (!this.#isEqual(val1[key], val2[key])) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    #compareCommands(savedCommand: SavedCommand, loadedCommand: ICommand | UserOrMessageCommand) {
        if (loadedCommand.type !== COMMAND_TYPES.CHAT_INPUT) {
            // TODO: this will need updating when user/message commands support name_localizations
            return savedCommand.name === loadedCommand.name && savedCommand.type === loadedCommand.type;
        }
        for (const key of COMPARE_COMMANDS_KEYS) {
            const expectedValue = savedCommand[key];
            const actualValue = loadedCommand[key];
            if (key === 'dm_permission') {
                // for this case, setting it to true makes discord return undefined. therefore only compare false
                if ((expectedValue === false && actualValue !== false) || (expectedValue !== false && actualValue === false)) {
                    return false;
                }
            }
            else if (!this.#isEqual(actualValue, expectedValue)) {
                return false;
            }
        }
        return true;
    }
}