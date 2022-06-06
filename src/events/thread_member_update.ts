import { EventHandler } from '../data/types';
import { ThreadMemberUpdateData, LowercaseEventName } from '../data/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class ThreadMemberUpdateHandler extends EventHandler<ThreadMemberUpdateData> {
    constructor(bot: Bot) {
        super(basename(__filename, '.js') as LowercaseEventName, bot);
    }

    handler = (/*eventData: ThreadMemberUpdateData*/) => {
        // event unused for now
    }
}