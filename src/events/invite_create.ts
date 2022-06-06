import { EventHandler } from '../data/types';
import { InviteCreateData, LowercaseEventName } from '../data/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class InviteCreateHandler extends EventHandler<InviteCreateData> {
    constructor(bot: Bot) {
        super(basename(__filename, '.js') as LowercaseEventName, bot);
    }

    handler = (/*eventData: InviteCreateData*/) => {
        // event unused for now
    }
}