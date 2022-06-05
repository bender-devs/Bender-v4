import { Interaction, InteractionResponse, UnixTimestampMillis } from "../data/types";
import Logger from "../structures/logger";
import { randomUUID } from "crypto";
import * as child_process from "child_process";
import { EXIT_CODE_NO_RESTART, RESPAWN_DEAD_SHARDS, EXIT_CODE_RESTART, SHARD_SPAWN_COMMAND, SHARD_SPAWN_FILE } from "../data/constants";

const shardOperations = [
    'ping', // ping a shard to make sure it's responsive
    'pong', // response to ping
    'request_values', // request values from a shard
    'receive_values' // respond with requested values
] as const;
type ShardOperation = typeof shardOperations[number];

type FetchCallback = (message: ShardMessage) => any;

export type ShardMessage = {
    operation: ShardOperation;
    fromShard: number | 'MANAGER';
    toShards: number[] | 'ALL' | 'MANAGER';
    nonce: string;
    data?: string;
}

export default class ShardManager {
    shardCount: number;
    #shardProcesses: (child_process.ChildProcess | null)[];
    logger: Logger;
    #lastActivityTimestamps: UnixTimestampMillis[];
    #callbacks: Record<string, FetchCallback>;

    constructor(count: number) {
        this.shardCount = count;
        this.#shardProcesses = [];
        this.#shardProcesses.fill(null, 0, count-1);
        this.logger = new Logger();
        this.#lastActivityTimestamps = [];
        this.#lastActivityTimestamps.fill(0, 0, count-1);
        this.#callbacks = {};
        process.on('message', this.handleMessage);
    }

    spawnProcesses() {
        for (let i = 0; i < this.shardCount; i++) {
            this.spawnProcess(i);
        }
    }

    spawnProcess(shardID: number): child_process.ChildProcess {
        const shardProcess = child_process.spawn(SHARD_SPAWN_COMMAND, [SHARD_SPAWN_FILE], {
            env: Object.assign({}, process.env, { 
                SHARD_ID: shardID,
                SHARD_COUNT: this.shardCount
            }),
            stdio: 'inherit'
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
        this.#lastActivityTimestamps[shardID] = Date.now();
        this.#shardProcesses[shardID] = shardProcess;
        return shardProcess;
    }

    handleDeadProcess(shardID: number) {
        const proc = this.#shardProcesses[shardID];
        this.logger.moduleLog(`Shard ${shardID}`, `Process died${proc?.exitCode ? ` with exit code ${proc.exitCode}` : ''}, rip`);
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
        } catch(err) {
            this.logger.handleError('dispatchMessage JSON.stringify', err, message);
            return;
        }
        return proc.send(messageString);
    }

    processMessage(message: ShardMessage) {
        if (message.toShards !== 'MANAGER' || message.fromShard === 'MANAGER') {
            return; // only process messages meant for the manager itself
        }
        switch (message.operation) {
            case 'ping': {
                return this.sendMessage({
                    operation: 'pong',
                    fromShard: 'MANAGER',
                    toShards: [message.fromShard],
                    nonce: message.nonce
                });
            }
            case 'pong': {
                this.#lastActivityTimestamps[message.fromShard] = Date.now();
            }
            // TODO: for receive_values, check this.#callbacks, group values if necessary, and send response message
        }
    }

    handleMessage(message: string) {
        this.logger.debug('SHARD MESSAGE', message);
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
            if (!messageObject.operation || !shardOperations.includes(messageObject.operation) || messageObject.toShards === undefined || messageObject.fromShard === undefined || messageObject.nonce === undefined) {
                return null;
            }
            if (logger) {
                logger.debug('PARSED SHARD MESSAGE', message);
            }
            return {
                operation: messageObject.operation,
                fromShard: messageObject.fromShard,
                toShards: messageObject.toShards,
                nonce: messageObject.nonce,
                data: messageObject.data
            }
        } catch(err) {
            if (logger) {
                logger.handleError('PARSING SHARD MESSAGE FAILED', err, message);
            }
            return null;
        }
    }

    getStats(shards: number[] | 'ALL') {
        const nonce = randomUUID();
        const message: ShardMessage = {
            operation: 'request_values',
            fromShard: 'MANAGER',
            toShards: shards,
            nonce,
            data: '' // TODO: put desired stats here
        };

        let callback: FetchCallback = () => this.logger.handleError('shardManager.getStats', 'CALLBACK BEFORE READY', message);
        this.#callbacks[nonce] = callback;

        this.sendMessage(message);
        return new Promise((resolve, reject) => {
            this.#callbacks[nonce] = resolve;
            setTimeout(() => {
                this.logger.debug('getStats TIMED OUT', message);
                delete this.#callbacks[nonce];
                reject();
            })
        })
    }

    async dispatchInteraction(interaction: Interaction): Promise<InteractionResponse> {
        if (interaction.type === 1) {
            return { type: 1 };
        }
        // TODO: determine which shard the interaction should go to and send it there
        return { type: 1 };
    }
}