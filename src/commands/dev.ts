import Command from '../structures/command';
import * as path from 'path';
import Bot from '../structures/bot';
import * as types from '../data/types';
import { COMMAND_OPTION_TYPES, INTERACTION_CALLBACK_FLAGS, INTERACTION_CALLBACK_TYPES } from '../data/numberTypes';
import APIError from '../structures/apiError';
import { ShardDestination, ShardOperation, SHARD_OPERATION_LIST } from '../utils/shardManager';
import { randomUUID } from 'crypto';

export default class DevCommand implements Command {
    bot: Bot;
    
    readonly name: string = path.parse(__filename).name;
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

    constructor (bot: Bot) {
        this.bot = bot;
    }

    async run(interaction: types.Interaction): types.CommandResponse {
        if ((interaction.member || interaction).user?.id !== '246107833295175681') {
            return this.respond(interaction, 'fuck you, unauthorized');
        }
        const args = interaction.data?.options;
        if (!args) {
            this.bot.logger.handleError('COMMAND FAILED: /dev', 'no arguments supplied');
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
                    // should never happen
                    return this.respond(interaction, 'Invalid args.');
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
                return this.respond(interaction, 'Message sent.');
            }
            default: {
                // should never happen
                return this.respond(interaction, 'Invalid subcommand.');
            }
        }
    }

    async respond(interaction: types.Interaction, content: string) {
        return this.bot.api.interaction.sendResponse(interaction, {
            type: INTERACTION_CALLBACK_TYPES.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content,
                flags: INTERACTION_CALLBACK_FLAGS.EPHEMERAL
            }
        }).catch((err: APIError) => {
            this.bot.logger.handleError('COMMAND FAILED: /dev', err);
            return null;
        });
    }
}