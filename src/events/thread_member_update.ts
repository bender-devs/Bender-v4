import { EventHandler } from '../types/types';
import { ThreadMemberUpdateData, LowercaseEventName } from '../types/gatewayTypes';
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