import { EventHandler } from '../types/types.js';
import { MessageDeleteData } from '../types/gatewayTypes.js';
import Bot from '../structures/bot.js';

export default class MessageDeleteHandler extends EventHandler<MessageDeleteData> {
    constructor(bot: Bot) {
        super('message_delete', bot);
    }

    cacheHandler = (eventData: MessageDeleteData) => {
        if (eventData.guild_id) {
            this.bot.cache.messages.delete(eventData.guild_id, eventData.channel_id, eventData.id);
        } else {
            this.bot.cache.dmMessages.delete(eventData.channel_id, eventData.id);
        }
    }

    handler = (/*eventData: MessageDeleteData*/) => {
        // TODO: if delete logging is enabled, post to log channel

        // TODO: if message is a giveaway, cancel the giveaway
        // (if giveaways aren't replaced with interactions)

        // TODO: if message is a role menu, delete it from the db
        // (if role menus aren't replaced with interactions)

        // TODO: if message is an agreement emoji message, delete it from the db
        // (if agreement isn't removed and the emoji message isn't replaced with interactions)
    }
}