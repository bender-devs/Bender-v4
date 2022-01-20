import * as dotenv from "dotenv";
import Bot from "./structures/bot";
import { SHARDED, SHARD_COUNT } from "./data/constants";
import ShardManager from "./utils/shardManager";
import Shard from "./structures/shard";

dotenv.config();

// TODO: process cli arguments
process.env.TOKEN = process.env.TOKEN_PRODUCTION;

if (SHARDED) {
    const shardManager = new ShardManager(SHARD_COUNT);
    for (let i = 0; i < SHARD_COUNT; i++) {
        const bot = new Bot();
        const shard = new Shard(bot, [i, SHARD_COUNT]);
        shard.manager = shardManager;
        bot.shard = shard;
        // TODO: connect bot
    }
} else {
    const bot = new Bot();
    // TODO: connect bot
}