import { EventHandler } from '../types/types';
import { MessageUpdateData, LowercaseEventName } from '../types/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class MessageUpdateHandler extends EventHandler<MessageUpdateData> {
    constructor(bot: Bot) {
        super(basename(__filename, '.js') as LowercaseEventName, bot);
    }

    cacheHandler = (eventData: MessageUpdateData) => {
        if (eventData.guild_id) {
            this.bot.cache.messages.update(eventData);
        } else {
            this.bot.cache.dmMessages.update(eventData);
        }
    }

    handler = (/*eventData: MessageUpdateData*/) => {
        // TODO: handle filter/automod

        // TODO: deal with agreement, if that feature isn't replaced by member screening

        // TODO: if text commands are added, process those

        // TODO: if content changed and edit logging is enabled, post to log channel
    }
}