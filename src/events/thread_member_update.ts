import type Bot from '../structures/bot.js';
import type { ThreadMemberUpdateData } from '../types/gatewayTypes.js';
import { EventHandler } from '../types/types.js';

export default class ThreadMemberUpdateHandler extends EventHandler<ThreadMemberUpdateData> {
    constructor(bot: Bot) {
        super('thread_member_update', bot);
    }

    handler = (/*eventData: ThreadMemberUpdateData*/) => {
        // event unused for now
    };
}
