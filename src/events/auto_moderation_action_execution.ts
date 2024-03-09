import type Bot from '../structures/bot.js';
import type { AutoModExecuteData } from '../types/gatewayTypes.js';
import { EventHandler } from '../types/types.js';

export default class AutoModExecuteHandler extends EventHandler<AutoModExecuteData> {
    constructor(bot: Bot) {
        super('auto_moderation_action_execution', bot);
    }

    handler = (/*eventData: AutoModExecuteData*/) => {
        // TODO: handle custom filter actions?
    };
}
