import { EventHandler } from '../data/types';
import { GuildStickersUpdateData, LowercaseEventName } from '../data/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class GuildStickersUpdateHandler extends EventHandler<GuildStickersUpdateData> {
    constructor(bot: Bot) {
        const filename = basename(__filename, '.js');
        super(filename as LowercaseEventName, bot);
    }

    handler = (/*eventData: GuildStickersUpdateData*/) => {
        // event unused for now
    }
}