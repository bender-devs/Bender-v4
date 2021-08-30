import { ShardConnectionData } from "../data/gatewayTypes";
import Bot from "./bot";

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
}