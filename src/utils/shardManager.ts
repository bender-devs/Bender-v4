import { UnixTimestamp } from "../data/types";
import Logger from "../structures/logger";

const shardOperations = ['ping', 'pong', 'get_value', 'get_values'] as const;
type ShardOperation = typeof shardOperations[number];

export type ShardMessage = {
    operation: ShardOperation;
    fromShard: number | null;
    toShards: number[] | null;
    data?: string;
}

export default class ShardManager {
    shard_count: number;
    logger: Logger;
    #lastActivityTimestamps: number[];

    constructor(count: number) {
        this.shard_count = count;
        this.logger = new Logger();
        this.#lastActivityTimestamps = new Array<UnixTimestamp>(count);
        this.#lastActivityTimestamps.fill(0);
        process.on('message', this.handleMessage);
    }

    sendMessage(message: ShardMessage) {

    }

    processMessage(message: ShardMessage) {
        if (message.fromShard === null) {
            return; // ignore messages from self
        }
        switch (message.operation) {
            case 'ping': {
                return this.sendMessage({
                    operation: 'pong',
                    fromShard: null,
                    toShards: [message.fromShard]
                });
            }
            case 'pong': {
                this.#lastActivityTimestamps[message.fromShard] = Date.now();
            }
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
            if (!messageObject.operation || !shardOperations.includes(messageObject.operation) || messageObject.toShards === undefined || messageObject.fromShard === undefined) {
                return null;
            }
            if (logger) {
                logger.debug('PARSED SHARD MESSAGE', message);
            }
            return {
                operation: messageObject.operation,
                fromShard: messageObject.fromShard,
                toShards: messageObject.toShards,
                data: messageObject.data
            }
        } catch(err) {
            if (logger) {
                logger.handleError('PARSING SHARD MESSAGE FAILED', err, message);
            }
            return null;
        }
    }
}