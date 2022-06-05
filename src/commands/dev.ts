import { ICommand, CommandUtils } from '../structures/command';
import * as path from 'path';
import Bot from '../structures/bot';
import * as types from '../data/types';
import { COMMAND_OPTION_TYPES } from '../data/numberTypes';
import { ShardDestination, ShardOperation, SHARD_OPERATION_LIST } from '../utils/shardManager';
import { randomUUID } from 'crypto';
import PermissionUtils from '../utils/permissions';

export default class DevCommand extends CommandUtils implements ICommand {
    constructor(bot: Bot) {
        super(bot, path.parse(__filename).name);
    }
    
    readonly dm_permission: boolean = true;
    readonly description = 'Super secret developer stuff';
    readonly options: types.CommandOption[] = [{
        type: COMMAND_OPTION_TYPES.SUB_COMMAND_GROUP,
        name: 'msg',
        description: 'Send a message to a shard or the shard manager.',
        options: [{
            type: COMMAND_OPTION_TYPES.SUB_COMMAND,
            name: 'manager',
            description: 'Send a message to the shard manager.',
            options: [{
                type: COMMAND_OPTION_TYPES.STRING,
                name: 'operation',
                description: 'The operation to perform on the shard manager.',
                required: true,
                choices: SHARD_OPERATION_LIST
            }, {
                type: COMMAND_OPTION_TYPES.STRING,
                name: 'data',
                description: 'The data string to send for operation data.'
            }, {
                type: COMMAND_OPTION_TYPES.STRING,
                name: 'nonce',
                description: 'A nonce to establish relationships to other messages. Default is a random UUID.'
            }]
        }]
    }];

    async run(interaction: types.Interaction): types.CommandResponse {
        const user = (interaction.member || interaction).user;
        if (!PermissionUtils.isOwner(user)) {
            return this.respond(interaction, '🔑 You aren\'t authorized to use this command.');
        }
        const args = interaction.data?.options;
        if (!args) {
            this.bot.logger.handleError('COMMAND FAILED: /dev', 'No arguments supplied [Should never happen...]');
            return null;
        }
        const command = args[0].name;
        switch (command) {
            case 'msg': {
                if (!this.bot.shard) {
                    return this.respond(interaction, 'This bot isn\'t sharded; can\'t send shard messages.');
                }
                const destination = args[0].options?.[0]?.name?.toUpperCase();
                const operation = args[0].options?.[0]?.options?.[0]?.value;
                if (!destination || !operation) {
                    this.bot.logger.handleError('COMMAND FAILED: /dev', 'No subcommand or required argument supplied [Should never happen...]');
                    return null;
                }
                const data = args[0].options?.[0]?.options?.[1]?.value;
                const nonce = args[0].options?.[0]?.options?.[2]?.value;
                this.bot.shard.sendMessage({
                    operation: operation as ShardOperation,
                    toShards: destination as ShardDestination,
                    fromShard: this.bot.shard.id,
                    nonce: nonce ? nonce as string : randomUUID(),
                    data: data ? data as string : undefined
                });
                return this.respond(interaction, '📬 Message sent.');
            }
            default: {
                this.bot.logger.handleError('COMMAND FAILED: /dev', 'Invalid subcommand [Should never happen...]');
                return null;
            }
        }
    }
}