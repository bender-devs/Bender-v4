import "dotenv/config";
import Bot from "./structures/bot";
import { SHARDED, SHARD_COUNT, CONNECT_DATA } from "./data/constants";
import ShardManager from "./utils/shardManager";
import Shard from "./structures/shard";
import { IdentifyData } from "./data/gatewayTypes";

console.log('Starting Bender with mode: ' + process.env.RUNTIME_MODE);
const TOKEN = process.env[`TOKEN_${process.env.RUNTIME_MODE}`];

if (!TOKEN) {
    console.error('ERROR: No token provided.');
    process.exit(1);
}

console.log('Bot starting, token length: ' + TOKEN.length)

const connectionData: IdentifyData = Object.assign({}, CONNECT_DATA, { token: TOKEN });

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