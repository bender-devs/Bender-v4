import { EventHandler } from '../types/types.js';
import { PresenceUpdateData } from '../types/gatewayTypes.js';
import Bot from '../structures/bot.js';

export default class PresenceUpdateHandler extends EventHandler<PresenceUpdateData> {
    constructor(bot: Bot) {
        super('presence_update', bot);
    }

    cacheHandler = (eventData: PresenceUpdateData) => {
        this.bot.cache.presences.set(eventData);
    }

    handler = (/*eventData: PresenceUpdateData*/) => {
        // TODO: anti-advertising/gamefilter functions
    }
}