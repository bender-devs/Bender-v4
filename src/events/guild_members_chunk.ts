import { EventHandler } from "../data/types";
import { GuildMembersChunkData, LowercaseEventName } from "../data/gatewayTypes";
import Bot from "../structures/bot";

export default class GuildMembersChunkHandler extends EventHandler {
    constructor(bot: Bot) {
        super(__filename as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: GuildMembersChunkData) => {
        this.bot.cache.members.addChunk(eventData.guild_id, eventData.members);
    }

    handler = (eventData: GuildMembersChunkData) => {

    }
}