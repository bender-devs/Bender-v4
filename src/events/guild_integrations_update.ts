import { EventHandler } from '../data/types';
import { GuildIntegrationsUpdateData, LowercaseEventName } from '../data/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class GuildIntegrationsUpdateHandler extends EventHandler<GuildIntegrationsUpdateData> {
    constructor(bot: Bot) {
        super(basename(__filename, '.js') as LowercaseEventName, bot);
    }

    handler = (/*eventData: GuildIntegrationsUpdateData*/) => {
        // event unused for now
    }
}