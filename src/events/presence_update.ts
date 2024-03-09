import type Bot from '../structures/bot.js';
import type { PresenceUpdateData } from '../types/gatewayTypes.js';
import { EventHandler } from '../types/types.js';

export default class PresenceUpdateHandler extends EventHandler<PresenceUpdateData> {
    constructor(bot: Bot) {
        super('presence_update', bot);
    }

    cacheHandler = (eventData: PresenceUpdateData) => {
        this.bot.cache.presences.set(eventData);
    };

    handler = (/*eventData: PresenceUpdateData*/) => {
        // TODO: anti-advertising/gamefilter functions
    };
}
