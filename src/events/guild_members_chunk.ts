import { EventHandler } from '../types/types.js';
import type { GuildMembersChunkData } from '../types/gatewayTypes.js';
import type Bot from '../structures/bot.js';

export default class GuildMembersChunkHandler extends EventHandler<GuildMembersChunkData> {
    constructor(bot: Bot) {
        super('guild_members_chunk', bot);
    }

    cacheHandler = (eventData: GuildMembersChunkData) => {
        this.bot.cache.members.addChunk(eventData.guild_id, eventData.members);
        if (eventData.presences) {
            this.bot.cache.presences.addChunk(eventData.presences);
        }
    }

    handler = (/*eventData: GuildMembersChunkData*/) => {
        // event unused for now
    }
}