import { EventHandler } from '../types/types.js';
import type { ThreadMembersUpdateData } from '../types/gatewayTypes.js';
import type Bot from '../structures/bot.js';

export default class ThreadMembersUpdateHandler extends EventHandler<ThreadMembersUpdateData> {
    constructor(bot: Bot) {
        super('thread_members_update', bot);
    }

    handler = (/*eventData: ThreadMembersUpdateData*/) => {
        // event unused for now
    }
}