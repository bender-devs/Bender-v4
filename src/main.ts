import * as dotenv from "dotenv";
import Bot from "./structures/bot";
import { SHARDED, SHARD_COUNT, CONNECT_DATA } from "./data/constants";
import ShardManager from "./utils/shardManager";
import Shard from "./structures/shard";
import { IdentifyData } from "./data/gatewayTypes";

dotenv.config();

// TODO: process cli arguments
process.env.TOKEN = process.env.TOKEN_ALPHA || '';

if (!process.env.TOKEN) {
    console.error('ERROR: No token provided.');
    process.exit(1);
}

console.log('Bot starting, token length: ' + process.env.TOKEN.length)

const connectionData: IdentifyData = Object.assign({}, CONNECT_DATA, { token: process.env.TOKEN });

if (process.env.SHARD_ID && process.env.SHARD_COUNT) {
    const id = parseInt(process.env.SHARD_ID);
    const count = parseInt(process.env.SHARD_COUNT);
    const bot = new Bot();
    const shard = new Shard(bot, [id, count]);
    bot.shard = shard;

    bot.connect(connectionData);
} else if (SHARDED) {
    const shardManager = new ShardManager(SHARD_COUNT);
    shardManager.spawnProcesses();
} else {
    console.log('Starting without shards')
    const bot = new Bot();
    bot.connect(connectionData);
}