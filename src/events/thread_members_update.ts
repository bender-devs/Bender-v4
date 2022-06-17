import { EventHandler } from '../types/types';
import { ThreadMembersUpdateData, LowercaseEventName } from '../types/gatewayTypes';
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