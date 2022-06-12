import { ICommand, CommandUtils } from '../structures/command';
import * as path from 'path';
import Bot from '../structures/bot';
import * as types from '../data/types';
import { COMMAND_OPTION_TYPES, GATEWAY_OPCODES } from '../data/numberTypes';
import { ShardDestination, ShardOperation, SHARD_OPERATION_LIST } from '../utils/shardManager';
import { randomUUID } from 'crypto';
import PermissionUtils from '../utils/permissions';
import LanguageUtils from '../utils/language';
import { GatewayData, GatewayPayload } from '../data/gatewayTypes';

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
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND_GROUP,
        name: 'gateway',
        description: 'Simulate/send events on the gateway.',
        options: [{
            type: COMMAND_OPTION_TYPES.SUB_COMMAND,
            name: 'send',
            description: 'Send an event to the gateway.',
            options: [{
                type: COMMAND_OPTION_TYPES.INTEGER,
                name: 'opcode',
                description: 'The operation to perform.',
                required: true,
                choices: [{
                    name: 'Heartbeat',
                    value: GATEWAY_OPCODES.HEARTBEAT
                }, {
                    name: 'Identify',
                    value: GATEWAY_OPCODES.IDENTIFY
                }, {
                    name: 'Presence Update',
                    value: GATEWAY_OPCODES.PRESENCE_UPDATE
                }, {
                    name: 'Voice State Update',
                    value: GATEWAY_OPCODES.VOICE_STATE_UPDATE
                }, {
                    name: 'Resume',
                    value: GATEWAY_OPCODES.RESUME
                }, {
                    name: 'Request Guild Members',
                    value: GATEWAY_OPCODES.REQUEST_GUILD_MEMBERS
                }]
            }, {
                type: COMMAND_OPTION_TYPES.STRING,
                name: 'data',
                description: 'The JSON data to send.',
                required: true
            }]
        }, {
            type: COMMAND_OPTION_TYPES.SUB_COMMAND,
            name: 'receive',
            description: 'Simulate a non-event payload from the gateway.',
            options: [{
                type: COMMAND_OPTION_TYPES.INTEGER,
                name: 'opcode',
                description: 'The operation to receive.',
                required: true,
                choices: [{
                    name: 'Heartbeat',
                    value: GATEWAY_OPCODES.HEARTBEAT
                }, {
                    name: 'Reconnect',
                    value: GATEWAY_OPCODES.RECONNECT
                }, {
                    name: 'Invalid Session',
                    value: GATEWAY_OPCODES.INVALID_SESSION
                }, {
                    name: 'Hello',
                    value: GATEWAY_OPCODES.HELLO
                }, {
                    name: 'Heartbeat ACK',
                    value: GATEWAY_OPCODES.HEARTBEAT_ACK
                }]
            }, {
                type: COMMAND_OPTION_TYPES.STRING,
                name: 'data',
                description: 'The JSON data to send.'
            }]
        }]
    }];

    async run(interaction: types.Interaction): types.CommandResponse {
        const user = (interaction.member || interaction).user;
        if (!PermissionUtils.isOwner(user)) {
            const permMsg = LanguageUtils.getAndReplace('COMMAND_UNAUTHORIZED', {}, interaction.locale);
            return this.respond(interaction, permMsg);
        }
        const args = interaction.data?.options;
        if (!args) {
            return this.handleUnexpectedError(interaction, 'ARGS_MISSING');
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
                    return this.handleUnexpectedError(interaction, 'SUBCOMMANDS_OR_ARGS_INCOMPLETE');
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
            case 'gateway': {
                const rawOpcode = args[0].options?.[0]?.options?.[0]?.value;
                const opcode = typeof rawOpcode === 'number' ? rawOpcode : null;
                const rawData = args[0].options?.[0]?.options?.[1]?.value;
                let data: string | null = null;
                if (typeof rawData === 'string') {
                    data = rawData || null;
                } else {
                    data = null;
                }
                if (!opcode || isNaN(opcode)) {
                    return this.handleUnexpectedError(interaction, 'ARGS_INCOMPLETE');
                }
                switch (args[0].options?.[0]?.name) {
                    case 'send': {
                        this.bot.gateway.sendData({
                            op: opcode,
                            d: data as GatewayData,
                            s: null,
                            t: null
                        });
                        return this.respond(interaction, '📤 Gateway event sent.');
                    }
                    case 'receive': {
                        const payload: GatewayPayload = {
                            op: opcode,
                            d: data as GatewayData,
                            s: null,
                            t: null
                        };
                        let payloadString = '';
                        try {
                            payloadString = JSON.stringify(payload);
                        } catch (err) {
                            return this.handleUnexpectedError(interaction, 'STRINGIFYING_FAILED');
                        }
                        this.bot.gateway.emit('message', payloadString);
                        return this.respond(interaction, '📥 Simulated gateway event.');
                    }
                }
                return this.handleUnexpectedError(interaction, 'INVALID_SUBCOMMAND');
            }
        }
        return this.handleUnexpectedError(interaction, 'INVALID_SUBCOMMAND_GROUP');
    }
}
