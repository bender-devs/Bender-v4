import * as child_process from 'child_process';
import { randomUUID } from 'crypto';
import {
    EXIT_CODE_NO_RESTART,
    EXIT_CODE_RESTART,
    RESPAWN_DEAD_SHARDS,
    SHARD_MESSAGE_TIMEOUT,
    SHARD_SPAWN_COMMAND,
    SHARD_SPAWN_FILE,
} from '../data/constants.js';
import type {
    CommandOptionChoice,
    Interaction,
    InteractionResponse,
    UnixTimestampMillis,
} from '../types/types.js';
import Logger from './logger.js';

const shardOperations = [
    'ping', // ping a shard to make sure it's responsive
    'pong', // response to ping
    'request_values', // request values from a shard
    'reply_with_values', // respond with requested values
] as const;
export type ShardOperation = (typeof shardOperations)[number];
export const SHARD_OPERATION_LIST: CommandOptionChoice[] = [
    { name: 'Ping', value: 'ping' }, // ping a shard to make sure it's responsive
    { name: 'Pong', value: 'pong' }, // response to ping
    { name: 'Request values', value: 'request_values' }, // request values from a shard
    { name: 'Reply with values', value: 'reply_with_values' }, // respond with requested values
];
export type ShardDestination = number[] | 'ALL' | 'MANAGER';
export const GENERAL_STATS = ['ping', 'uptime', 'lastActivity', 'totalGuilds', 'availableGuilds'];

export type ShardMessage = {
    operation: ShardOperation;
    fromShard: number | 'MANAGER';
    toShards: ShardDestination;
    nonce: string;
    data?: string;
};

export type ShardManagerValues = {
    pids?: (number | null)[];
    lastActivity?: number[];
    uptime?: number[];
};

export type ShardValues = {
    guildCount?: number;
    memberCount?: number;
    userCount?: number;
    channelCount?: number;
};

export type ShardFetchData = ShardValues | null;
export type ShardFetchCallback = (fetchData: ShardFetchData[]) => ShardValues | null | void;
export type ShardComplexCallbackData = {
    completed: number;
    expected: number;
    currentValues: ShardFetchData[];
};

export default class ShardManager {
    logger: Logger;
    shardCount: number;
    #callbacks: Record<string, ShardFetchCallback>;
    #complexCallbacks: Record<string, ShardComplexCallbackData>;
    #timeouts: Record<string, NodeJS.Timeout>;
    #shardProcesses: (child_process.ChildProcess | null)[];
    #lastActivityTimestamps: UnixTimestampMillis[];
    #upSinceTimestamps: UnixTimestampMillis[];

    constructor(count: number) {
        this.logger = new Logger();
        this.shardCount = count;
        this.#callbacks = {};
        this.#complexCallbacks = {};
        this.#timeouts = {};

        this.#shardProcesses = [];
        this.#shardProcesses.fill(null, 0, count - 1);
        this.#lastActivityTimestamps = [];
        this.#lastActivityTimestamps.fill(0, 0, count - 1);
        this.#upSinceTimestamps = [];
        this.#upSinceTimestamps.fill(0, 0, count - 1);

        process.on('message', this.handleMessage);
    }

    spawnProcesses() {
        for (let i = 0; i < this.shardCount; i++) {
            // flush cache on first boot for first shard
            this.spawnProcess(i, i === 0);
        }
    }

    spawnProcess(shardID: number, flushCache = false): child_process.ChildProcess {
        const shardProcess = child_process.spawn(SHARD_SPAWN_COMMAND, [SHARD_SPAWN_FILE], {
            env: Object.assign({}, process.env, {
                SHARD_ID: shardID,
                SHARD_COUNT: this.shardCount,
                FLUSH_CACHE: flushCache,
            }),
            stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
        });
        shardProcess.on('error', (err: Error) => {
            this.logger.handleError(`UNHANDLED EXCEPTION [SHARD ${shardID}]`, err);
        });
        shardProcess.on('disconnect', () => this.handleDeadProcess(shardID));
        shardProcess.on('exit', () => this.handleDeadProcess(shardID));
        shardProcess.on('message', (messageString: string) => {
            const message = this.parseMessage(messageString);
            if (message) {
                this.processMessage(message);
            }
        });
        this.#shardProcesses[shardID] = shardProcess;
        this.#lastActivityTimestamps[shardID] = Date.now();
        this.#upSinceTimestamps[shardID] = Date.now();
        return shardProcess;
    }

    handleDeadProcess(shardID: number) {
        const proc = this.#shardProcesses[shardID];
        this.logger.moduleLog(
            `Shard ${shardID}`,
            `Process died${proc?.exitCode ? ` with exit code ${proc.exitCode}` : ''}, rip`
        );
        if (proc && !proc.exitCode) {
            proc.kill(EXIT_CODE_RESTART);
        } else if (proc?.exitCode === EXIT_CODE_NO_RESTART) {
            // TODO: kill all shards?
            this.#shardProcesses[shardID] = null;
            return;
        }
        this.#shardProcesses[shardID] = null;
        if (RESPAWN_DEAD_SHARDS) {
            this.logger.debug(`Shard ${shardID}`, 'Respawning...');
            this.spawnProcess(shardID);
        }
    }

    sendMessage(message: ShardMessage) {
        if (message.toShards === 'MANAGER') {
            return; // don't create a loop sending messages to self
        }
        let toShards: number[] = [];
        if (message.toShards === 'ALL') {
            for (let i = 0; i < this.shardCount; i++) {
                toShards.push(i);
            }
        } else {
            toShards = message.toShards;
        }
        const toProcesses: child_process.ChildProcess[] = [];
        for (const shardID of toShards) {
            const proc = this.#shardProcesses[shardID];
            if (proc) {
                toProcesses.push(proc);
            }
        }
        for (const proc of toProcesses) {
            this.dispatchMessage(proc, message);
        }
    }

    dispatchMessage(proc: child_process.ChildProcess, message: ShardMessage) {
        let messageString = '';
        try {
            messageString = JSON.stringify(message);
        } catch (err) {
            this.logger.handleError('dispatchMessage JSON.stringify', err, message);
            return;
        }
        return proc.send(messageString);
    }

    processMessage(message: ShardMessage) {
        if (message.fromShard === 'MANAGER') {
            this.logger.debug('IGNORING SHARD MESSAGE', message, '(from self)');
            return; // avoid infinite loops
        }
        if (message.toShards !== 'MANAGER') {
            return this.sendMessage(message); // forward messages to other shards
        }
        switch (message.operation) {
            case 'ping': {
                return this.sendMessage({
                    operation: 'pong',
                    fromShard: 'MANAGER',
                    toShards: [message.fromShard],
                    nonce: message.nonce,
                });
            }
            case 'request_values': {
                const values = message.data?.split(',');
                if (!values) {
                    break;
                }
                if (!values.includes('pids') && !values.includes('lastActivity') && !values.includes('uptime')) {
                    this.logger.debug(
                        'IGNORING SHARD MESSAGE',
                        message,
                        '(requesting shard manager values other than pids, lastActivity, or uptime)'
                    );
                    break;
                }
                const responseMessage: ShardMessage = {
                    operation: 'reply_with_values',
                    fromShard: 'MANAGER',
                    toShards: [message.fromShard],
                    nonce: message.nonce,
                };
                const data: ShardManagerValues = {};
                if (values.includes('pids')) {
                    data.pids = this.#shardProcesses.map((proc) => proc?.pid || null);
                }
                if (values.includes('lastActivity')) {
                    data.lastActivity = this.#lastActivityTimestamps;
                }
                if (values.includes('uptime')) {
                    data.uptime = this.#upSinceTimestamps;
                }
                responseMessage.data = JSON.stringify(data);
                return this.sendMessage(responseMessage);
            }
            case 'reply_with_values': {
                let parsedValues: ShardFetchData = null;
                try {
                    parsedValues = message.data ? JSON.parse(message.data) : null;
                } catch (err) {
                    this.logger.handleError('SHARD MESSAGE', 'Failed to parse returned values:', message.data);
                }
                if (this.#complexCallbacks[message.nonce]) {
                    this.#handleComplexCallback(message.nonce, parsedValues);
                } else if (this.#callbacks[message.nonce]) {
                    this.#callbacks[message.nonce]([parsedValues]);
                    delete this.#callbacks[message.nonce];
                    clearTimeout(this.#timeouts[message.nonce]);
                }
                break;
            }
            case 'pong':
            default: {
                this.#lastActivityTimestamps[message.fromShard] = Date.now();
                break;
            }
        }
    }

    handleMessage(message: string) {
        const parsedMessage = this.parseMessage(message);
        if (parsedMessage) {
            this.processMessage(parsedMessage);
        }
    }

    parseMessage(message: string): ShardMessage | null {
        return ShardManager.parseMessage(message, this.logger);
    }

    static parseMessage(message: string, logger?: Logger): ShardMessage | null {
        try {
            const messageObject = JSON.parse(message);
            if (
                !messageObject.operation ||
                !shardOperations.includes(messageObject.operation) ||
                messageObject.toShards === undefined ||
                messageObject.fromShard === undefined ||
                messageObject.nonce === undefined
            ) {
                return null;
            }
            return {
                operation: messageObject.operation,
                fromShard: messageObject.fromShard,
                toShards: messageObject.toShards,
                nonce: messageObject.nonce,
                data: messageObject.data,
            };
        } catch (err) {
            if (logger) {
                logger.handleError('PARSING SHARD MESSAGE FAILED', err, message);
            } else {
                console.error('PARSING SHARD MESSAGE FAILED', err, message);
            }
            return null;
        }
    }

    async getStats(shards: number[] | 'ALL' = 'ALL') {
        return this.getValues(shards, GENERAL_STATS);
    }

    #handleComplexCallback(nonce: string, fetchData: ShardFetchData) {
        const cc = this.#complexCallbacks[nonce];
        if (!cc || !this.#callbacks[nonce]) {
            return null;
        }
        cc.currentValues.push(fetchData);
        cc.completed += 1;
        if (cc.completed >= cc.expected) {
            delete this.#complexCallbacks[nonce];
            this.#callbacks[nonce](cc.currentValues);
            delete this.#callbacks[nonce];
            clearTimeout(this.#timeouts[nonce]);
        } else {
            this.#complexCallbacks[nonce] = cc;
        }
    }

    async getValues(shards: number[] | 'ALL', values: string[]): Promise<ShardFetchData[] | null> {
        if (!values.length) {
            return null;
        }
        const nonce = randomUUID();
        const message: ShardMessage = {
            operation: 'request_values',
            fromShard: 'MANAGER',
            toShards: shards,
            nonce,
            data: values.join(','),
        };

        const callback: ShardFetchCallback = () => {
            this.logger.handleError('shardManager.getStats', 'CALLBACK BEFORE READY', message);
            return null;
        };
        this.#callbacks[nonce] = callback;

        this.sendMessage(message);
        return new Promise((resolve, reject) => {
            if (shards === 'ALL' || shards.length) {
                this.#complexCallbacks[nonce] = {
                    completed: 0,
                    expected: shards === 'ALL' ? this.shardCount : shards.length,
                    currentValues: [],
                };
            }
            this.#callbacks[nonce] = resolve;
            this.#timeouts[nonce] = setTimeout(() => {
                this.logger.debug('shardManager.getStats', 'TIMED OUT', message);
                delete this.#callbacks[nonce];
                reject('Shard operation timed out.');
            }, SHARD_MESSAGE_TIMEOUT);
        });
    }

    async dispatchInteraction(interaction: Interaction): Promise<InteractionResponse> {
        if (interaction.type === 1) {
            return { type: 1 };
        }
        // TODO: determine which shard the interaction should go to and send it there
        return { type: 1 };
    }
}
