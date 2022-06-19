import { EventHandler } from '../types/types';
import { GuildMembersChunkData, LowercaseEventName } from '../types/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class GuildMembersChunkHandler extends EventHandler<GuildMembersChunkData> {
    constructor(bot: Bot) {
        super(basename(__filename, '.js') as LowercaseEventName, bot);
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