import { ICommand, CommandUtils } from '../structures/command.js';
import Bot from '../structures/bot.js';
import { CommandOption, CommandResponse, Interaction } from '../types/types.js';
import { COMMAND_OPTION_TYPES, GATEWAY_OPCODES } from '../types/numberTypes.js';
import { ShardDestination, ShardOperation, SHARD_OPERATION_LIST } from '../structures/shardManager.js';
import { randomUUID } from 'crypto';
import PermissionUtils from '../utils/permissions.js';
import LangUtils from '../utils/language.js';
import { GatewayData, GatewayPayload } from '../types/gatewayTypes.js';
import { VERSION } from '../data/constants.js';
import { inspect, promisify } from 'util';
import { exec } from 'child_process';
import TextUtils from '../utils/text.js';
const execAsync = promisify(exec);

const tokenRegexes: RegExp[] = [];
if (process.env.TOKEN_ALPHA) {
    tokenRegexes.push(new RegExp(process.env.TOKEN_ALPHA.replace(/\./g, '\\.')));
}
if (process.env.TOKEN_BETA) {
    tokenRegexes.push(new RegExp(process.env.TOKEN_BETA.replace(/\./g, '\\.')));
}
if (process.env.TOKEN_PRODUCTION) {
    tokenRegexes.push(new RegExp(process.env.TOKEN_PRODUCTION.replace(/\./g, '\\.')));
}
if (process.env.TOKEN_PREMIUM) {
    tokenRegexes.push(new RegExp(process.env.TOKEN_PREMIUM.replace(/\./g, '\\.')));
}

function replaceTokens(text: string) {
    for (const regex of tokenRegexes) {
        text = text.replace(regex, '"mfa.QmS7GF8--YoU--r90er.V0x--fUcKiNg--ioy.eBEB4--SuCk--b605hyI.vjd098"');
    }
    return text;
}

// this command not localized as it's only developer-only

export default class DevCommand extends CommandUtils implements ICommand {
    constructor(bot: Bot) {
        super(bot, LangUtils.get('DEV_NAME'));
    }
    readonly name_localizations = LangUtils.getLocalizationMap('DEV_NAME');

    readonly description = LangUtils.get('DEV_DESCRIPTION');
    readonly description_localizations = LangUtils.getLocalizationMap('DEV_DESCRIPTION');

    readonly dm_permission: boolean = true;

    readonly options: CommandOption[] = [{
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
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND_GROUP,
        name: 'run',
        description: 'Run code in the context of the bot or on its server.',
        options: [{
            type: COMMAND_OPTION_TYPES.SUB_COMMAND,
            name: 'eval',
            description: 'Run code in the context of the bot.',
            options: [{
                type: COMMAND_OPTION_TYPES.STRING,
                name: 'code',
                description: 'The code to run.'
            }]
        }, {
            type: COMMAND_OPTION_TYPES.SUB_COMMAND,
            name: 'exec',
            description: 'Run code on the bot\'s server.',
            options: [{
                type: COMMAND_OPTION_TYPES.STRING,
                name: 'code',
                description: 'The code to run.'
            }]
        }]
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND_GROUP,
        name: 'shard',
        description: 'Perform operations on shard(s).',
        options: [{
            type: COMMAND_OPTION_TYPES.SUB_COMMAND,
            name: 'get',
            description: 'Get values from a shard or all shards.',
            options: [{
                type: COMMAND_OPTION_TYPES.INTEGER,
                name: 'shard-id',
                description: 'The shard ID from which to get values.'
            }, {
                type: COMMAND_OPTION_TYPES.STRING,
                name: 'value',
                description: 'The value to get.'
            }]
        }]
    }];

    async run(interaction: Interaction): CommandResponse {
        const user = (interaction.member || interaction).user;
        if (!PermissionUtils.isOwner(user)) {
            return this.respondKey(interaction, 'COMMAND_UNAUTHORIZED', 'AUTH', true);
        }
        const args = interaction.data?.options;
        if (!args) {
            return this.handleUnexpectedError(interaction, 'ARGS_MISSING');
        }
        const command = args[0].name;
        switch (command) {
            case 'msg': {
                if (!this.bot.shard) {
                    return this.respond(interaction, 'This bot isn\'t sharded; can\'t send shard messages.', 'ERROR', true);
                }
                const destination = args[0].options?.[0]?.name?.toUpperCase();
                const operation = args[0].options?.[0]?.options?.find(opt => opt.name === 'operation')?.value;
                if (!destination || !operation) {
                    return this.handleUnexpectedError(interaction, 'SUBCOMMANDS_OR_ARGS_INCOMPLETE');
                }
                const data = args[0].options?.[0]?.options?.find(opt => opt.name === 'data')?.value;
                const nonce = args[0].options?.[0]?.options?.find(opt => opt.name === 'nonce')?.value;
                this.bot.shard.sendMessage({
                    operation: operation as ShardOperation,
                    toShards: destination as ShardDestination,
                    fromShard: this.bot.shard.id,
                    nonce: nonce ? nonce as string : randomUUID(),
                    data: data ? data as string : undefined
                });
                return this.respond(interaction, 'Message sent.', 'MSG_SENT', true);
            }
            case 'gateway': {
                const rawOpcode = args[0].options?.[0]?.options?.find(opt => opt.name === 'opcode')?.value;
                const opcode = typeof rawOpcode === 'number' ? rawOpcode : null;
                const rawData = args[0].options?.[0]?.options?.find(opt => opt.name === 'data')?.value;
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
                        return this.respond(interaction, 'Gateway event sent.', 'SENT', true);
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
                        return this.respond(interaction, 'Simulated gateway event.', 'RECEIVED', true);
                    }
                }
                return this.handleUnexpectedError(interaction, 'INVALID_SUBCOMMAND');
            }
            case 'run': {
                const subcommand = args[0].options?.[0]?.name;
                const code = args[0].options?.[0]?.options?.[0]?.value;
                if (!subcommand || typeof subcommand !== 'string' || !code || typeof code !== 'string') {
                    return this.handleUnexpectedError(interaction, 'SUBCOMMANDS_OR_ARGS_INCOMPLETE');
                }
                await this.ack(interaction);

                const start = Date.now();
                let stop = 0;

                let footer = '', maxLength = 1950;
                try {
                    let evaled = '', evaledColor = '';
                    if (subcommand === 'eval') {
                        const result = await eval(code);
                        const typeofResult = typeof result;
                        evaled = inspect(result, false, 1);
                        evaledColor = inspect(result, false, 1, true);
                        const bender = this.getEmoji('BENDER', interaction);
                        const node = this.getEmoji('NODEJS', interaction);
                        const info = this.getEmoji('INFO', interaction);
                        footer = `\n${bender} Bender v${VERSION} | ${node} Node ${process.version} | ${info} Typeof output: \`${typeofResult}\``;
                    } else {
                        const result = await execAsync(code);
                        if (result.stderr) {
                            throw new Error(result.stderr);
                        }
                        evaled = result.stdout || '<no output>';
                    }
                    maxLength -= footer.length;

                    evaled = replaceTokens(evaled.replace('`', '\\`'));

                    const truncated = evaled.length >= maxLength;
                    if (truncated) {
                        this.bot.logger.moduleLog(subcommand.toUpperCase(), evaledColor);
                        evaled = TextUtils.truncate(evaled, maxLength - 50, '```');
                    }

                    stop = Date.now();

                    const elapsedTime = stop - start < 1000 ? `${stop - start}ms` : `${Math.round((stop - start) / 100) / 10}s`;
                    return this.deferredResponse(interaction, `💻 Executed in \`${elapsedTime}\`. Output:\n\`\`\`js\n${evaled}${truncated ? '\n(Truncated; full results in console)' : '```'}${footer}`);

                } catch (err) {
                    maxLength -= footer.length;

                    stop = Date.now();

                    let errString = `${err}`;
                    const truncated = errString.length >= maxLength;
                    if (truncated) {
                        this.bot.logger.moduleLog(subcommand.toUpperCase(), errString);
                        errString = TextUtils.truncate(errString, maxLength - 50, '```');
                    }
                    const elapsedTime = stop - start < 1000 ? `${stop - start}ms` : `${Math.round((stop - start) / 100) / 10}s`;
                    return this.deferredResponse(interaction, `❌ Executed in \`${elapsedTime}\`. Error:\n\`\`\`js\n${errString}${truncated ? '\n(Truncated; full results in console)' : '```'}${footer}`);
                }
            }
            case 'shard': {
                if (!this.bot.shard) {
                    return this.respond(interaction, 'Bot isn\'t sharded.', 'ERROR', true);
                }
                const subcommand = args[0].options?.[0]?.name;
                const values = args[0].options?.[0]?.options?.find(opt => opt.name === 'value')?.value;
                if (!subcommand || typeof subcommand !== 'string' || !values || typeof values !== 'string') {
                    return this.handleUnexpectedError(interaction, 'SUBCOMMANDS_OR_ARGS_INCOMPLETE');
                }
                const rawShardID = args[0].options?.[0]?.options?.find(opt => opt.name === 'shard-id')?.value;
                const shardID = typeof rawShardID === 'number' ? rawShardID : null;

                await this.ack(interaction);

                const start = Date.now();
                let stop = 0, err;

                const result = await this.bot.shard.getValues(shardID ? [shardID] : 'ALL', values.split(',')).catch(e => err = e);

                stop = Date.now();
                const elapsedTime = stop - start < 1000 ? `${stop - start}ms` : `${Math.round((stop - start) / 100) / 10}s`;

                if (!result || err) {
                    return this.deferredResponse(interaction, `❌ Failed to fetch values in \`${elapsedTime}\`.\n${err || ''}`);
                }
                return this.deferredResponse(interaction, `💻 Fetched shard values in \`${elapsedTime}\`.\n\`\`\`js\n${inspect(result, false, 1)}\`\`\``);
            }
        }
        return this.handleUnexpectedError(interaction, 'INVALID_SUBCOMMAND_GROUP');
    }
}
