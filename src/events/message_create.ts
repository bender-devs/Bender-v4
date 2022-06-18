import { EventHandler } from '../types/types';
import { MessageCreateData, LowercaseEventName } from '../types/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class MessageCreateHandler extends EventHandler<MessageCreateData> {
    constructor(bot: Bot) {
        super(basename(__filename, '.js') as LowercaseEventName, bot);
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
        // TODO: handle text commands (?)
        // TODO: handle filter/automod
    }
}