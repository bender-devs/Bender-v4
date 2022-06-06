import { EventHandler } from '../data/types';
import { GuildBanEventData, LowercaseEventName } from '../data/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class GuildBanRemoveHandler extends EventHandler<GuildBanEventData> {
    constructor(bot: Bot) {
        super(basename(__filename, '.js') as LowercaseEventName, bot);
    }

    handler = (/*eventData: GuildBanEventData*/) => {
        // event unused for now
    }
}