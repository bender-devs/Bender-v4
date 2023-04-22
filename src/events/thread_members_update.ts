import { EventHandler } from '../types/types.js';
import { ThreadMembersUpdateData } from '../types/gatewayTypes.js';
import Bot from '../structures/bot.js';

export default class ThreadMembersUpdateHandler extends EventHandler<ThreadMembersUpdateData> {
    constructor(bot: Bot) {
        super('thread_members_update', bot);
    }

    handler = (/*eventData: ThreadMembersUpdateData*/) => {
        // event unused for now
    }
}