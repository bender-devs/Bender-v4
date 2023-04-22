import { EventHandler } from '../types/types.js';
import { ThreadMemberUpdateData } from '../types/gatewayTypes.js';
import Bot from '../structures/bot.js';

export default class ThreadMemberUpdateHandler extends EventHandler<ThreadMemberUpdateData> {
    constructor(bot: Bot) {
        super('thread_member_update', bot);
    }

    handler = (/*eventData: ThreadMemberUpdateData*/) => {
        // event unused for now
    }
}