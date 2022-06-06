import { EventHandler } from '../data/types';
import { ThreadMembersUpdateData, LowercaseEventName } from '../data/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class ThreadMembersUpdateHandler extends EventHandler<ThreadMembersUpdateData> {
    constructor(bot: Bot) {
        super(basename(__filename, '.js') as LowercaseEventName, bot);
    }

    handler = (/*eventData: ThreadMembersUpdateData*/) => {
        // event unused for now
    }
}