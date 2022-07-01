import { ShardConnectionData } from '../types/gatewayTypes';
import ShardManager, { GENERAL_STATS, ShardDestination, ShardMessage } from './shardManager';
import Bot from './bot';
import { randomUUID } from 'crypto';
import { SHARD_MESSAGE_TIMEOUT } from '../data/constants';

type FetchData = unknown[] | null;
type FetchCallback = (fetchData: FetchData) => unknown;
type ComplexCallbackData = {
    completed: number;
    expected: number;
    currentValues: FetchData[];
}

export default class Shard {
    bot: Bot;
    id!: number;
    total_shards!: number;
    #callbacks: Record<string, FetchCallback>;
    #complexCallbacks: Record<string, ComplexCallbackData>;
    #timeouts: Record<string, NodeJS.Timeout>;

    constructor(bot: Bot, data: ShardConnectionData) {
        this.bot = bot;
        this.setShardData(data);
        this.#callbacks = {};
        this.#complexCallbacks = {};
        this.#timeouts = {};
    }

    setShardData(data: ShardConnectionData) {
        this.id = data[0];
        this.total_shards = data[1];
    }

    async processMessage(message: ShardMessage) {
        if (!this.bot.shard || (Array.isArray(message.toShards) && !message.toShards.includes(this.bot.shard.id))) {
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
            case 'request_values': {
                const values = message.data?.split(',');
                if (!values) {
                    break;
                }
                if (!values.includes('guildCount') && !values.includes('userCount')) {
                    this.bot.logger.debug('IGNORING SHARD MESSAGE', message, '(requesting shard values other than guildCount or userCount)');
                    break;
                }
                const responseMessage: ShardMessage = {
                    operation: 'reply_with_values',
                    fromShard: this.id,
                    toShards: message.fromShard === 'MANAGER' ? 'MANAGER' : [message.fromShard],
                    nonce: message.nonce
                }
                const data: { guildCount?: number, memberCount?: number, userCount?: number } = {};
                if (values.includes('guildCount')) {
                    data.guildCount = this.bot.cache.guilds.size();
                }
                if (values.includes('userCount')) {
                    data.userCount = await this.bot.cache.users.size();
                }
                if (values.includes('memberCount')) {
                    data.memberCount = this.bot.cache.members.totalSize();
                }
                responseMessage.data = JSON.stringify(data);
                return this.sendMessage(responseMessage);
            }
            case 'reply_with_values': {
                let parsedValues: FetchData = null;
                try {
                    parsedValues = message.data ? JSON.parse(message.data) : null;
                } catch(err) {
                    this.bot.logger.handleError('SHARD MESSAGE', 'Failed to parse returned values:', message.data);
                }
                if (this.#complexCallbacks[message.nonce]) {
                    this.#handleComplexCallback(message.nonce, parsedValues);
                } else if (this.#callbacks[message.nonce]) {
                    this.#callbacks[message.nonce](parsedValues);
                    delete this.#callbacks[message.nonce];
                    clearTimeout(this.#timeouts[message.nonce]);
                }
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

    async getStats(shards: ShardDestination) {
        const nonce = randomUUID();
        const message: ShardMessage = {
            operation: 'request_values',
            fromShard: this.id,
            toShards: shards,
            nonce,
            data: GENERAL_STATS.join(',')
        };

        const callback: FetchCallback = () => this.bot.logger.handleError('getStats', 'CALLBACK BEFORE READY', message);
        this.#callbacks[nonce] = callback;

        this.sendMessage(message);
        return new Promise((resolve, reject) => {
            this.#callbacks[nonce] = resolve;
            this.#timeouts[nonce] = setTimeout(() => {
                this.bot.logger.debug('getStats', 'TIMED OUT', message);
                delete this.#callbacks[nonce];
                reject();
            })
        })
    }

    #handleComplexCallback(nonce: string, fetchData: FetchData) {
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

    async getValues(shards: number[] | 'ALL', values: string[]): Promise<FetchData> {
        if (!values.length) {
            return null;
        }
        const nonce = randomUUID();
        const message: ShardMessage = {
            operation: 'request_values',
            fromShard: this.id,
            toShards: shards,
            nonce,
            data: values.join(',')
        };

        const callback: FetchCallback = () => this.bot.logger.handleError('shard.getStats', 'CALLBACK BEFORE READY', message);
        this.#callbacks[nonce] = callback;

        this.sendMessage(message);
        return new Promise((resolve, reject) => {
            if (shards === 'ALL') {
                this.#complexCallbacks[nonce] = {
                    completed: 0,
                    expected: this.total_shards,
                    currentValues: []
                };
            }
            this.#callbacks[nonce] = resolve;
            this.#timeouts[nonce] = setTimeout(() => {
                this.bot.logger.debug('getStats TIMED OUT', message);
                delete this.#callbacks[nonce];
                reject('Shard operation timed out.');
            }, SHARD_MESSAGE_TIMEOUT);
        })
    }
}