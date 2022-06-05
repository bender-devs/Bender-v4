import { ShardConnectionData } from '../data/gatewayTypes';
import ShardManager, { ShardMessage } from '../utils/shardManager';
import Bot from './bot';

export default class Shard {
    bot: Bot;
    id!: number;
    total_shards!: number;

    constructor(bot: Bot, data: ShardConnectionData) {
        this.bot = bot;
        this.setShardData(data);
    }

    setShardData(data: ShardConnectionData) {
        this.id = data[0];
        this.total_shards = data[1];
    }

    processMessage(message: ShardMessage) {
        if (!this.bot.shard || !Array.isArray(message.toShards) || !message.toShards.includes(this.bot.shard.id)) {
            return; // invalid message or not intended for this shard
        }
        switch (message.operation) {
            case 'ping': {
                return this.sendMessage({
                    operation: 'pong',
                    fromShard: this.bot.shard.id,
                    toShards: message.fromShard === 'MANAGER' ? 'MANAGER' : [message.fromShard],
                    nonce: message.nonce
                });
            }
            case 'pong': {
                break;
            }
            // TODO: for receive_values, check this.#callbacks, group values if necessary, and send response message
        }
    }

    handleMessage(message: string) {
        const parsedMessage = this.parseMessage(message);
        if (parsedMessage) {
            this.processMessage(parsedMessage);
        }
    }

    sendMessage(message: ShardMessage) {
        const stringifiedMessage = JSON.stringify(message);
        if (!process.send) {
            this.bot.logger.handleError('SHARD MESSAGE', 'Tried to send a shard message from an unsharded client.');
            return;
        }
        // send to parent process, which is the shard manager, and it will be forwarded to other shards if necessary
        process.send(stringifiedMessage);
    }

    parseMessage(message: string): ShardMessage | null {
        return ShardManager.parseMessage(message, this.bot.logger);
    }
}