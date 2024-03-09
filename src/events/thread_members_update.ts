import type Bot from '../structures/bot.js';
import type { ThreadMembersUpdateData } from '../types/gatewayTypes.js';
import { EventHandler } from '../types/types.js';

export default class ThreadMembersUpdateHandler extends EventHandler<ThreadMembersUpdateData> {
    constructor(bot: Bot) {
        super('thread_members_update', bot);
    }

    handler = (/*eventData: ThreadMembersUpdateData*/) => {
        // event unused for now
    };
}
