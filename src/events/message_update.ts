import type Bot from '../structures/bot.js';
import type { MessageUpdateData } from '../types/gatewayTypes.js';
import { EventHandler } from '../types/types.js';

export default class MessageUpdateHandler extends EventHandler<MessageUpdateData> {
    constructor(bot: Bot) {
        super('message_update', bot);
    }

    cacheHandler = (eventData: MessageUpdateData) => {
        if (eventData.guild_id) {
            this.bot.cache.messages.update(eventData);
        } else {
            this.bot.cache.dmMessages.update(eventData);
        }
    };

    handler = (/*eventData: MessageUpdateData*/) => {
        // TODO: check ephemeral flag before anything else
        // TODO: handle filter/automod
        // TODO: deal with agreement, if that feature isn't replaced by member screening
        // TODO: if text commands are added, process those
        // TODO: if content changed and edit logging is enabled, post to log channel
    };
}
