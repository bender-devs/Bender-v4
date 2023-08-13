import { EventHandler } from '../types/types.js';
import type { MessageCreateData } from '../types/gatewayTypes.js';
import type Bot from '../structures/bot.js';

export default class MessageCreateHandler extends EventHandler<MessageCreateData> {
    constructor(bot: Bot) {
        super('message_create', bot);
    }

    cacheHandler = (eventData: MessageCreateData) => {
        if (eventData.guild_id) {
            // TODO: check if guild has text commands/moderation enabled
            this.bot.cache.messages.create(eventData);
        } else {
            this.bot.cache.dmMessages.create(eventData);
        }
    }

    handler = (/*eventData: MessageCreateData*/) => {
        // TODO: check ephemeral flag before anything else
        
        // TODO: handle filter/automod

        // TODO: if text commands are added, process those

        // TODO: deal with agreement, if that feature isn't replaced by member screening or converted to interactions

        // TODO: if message mentions a role, handle mentionables
    }
}