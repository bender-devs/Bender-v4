import { EventHandler } from '../data/types';
import { InviteDeleteData, LowercaseEventName } from '../data/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class InviteDeleteHandler extends EventHandler<InviteDeleteData> {
    constructor(bot: Bot) {
        super(basename(__filename, '.js') as LowercaseEventName, bot);
    }

    handler = (/*eventData: InviteDeleteData*/) => {
        // event unused for now
    }
}