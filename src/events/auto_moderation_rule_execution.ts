import { EventHandler } from '../types/types.js';
import type { AutoModExecuteData } from '../types/gatewayTypes.js';
import type Bot from '../structures/bot.js';

export default class AutoModExecuteHandler extends EventHandler<AutoModExecuteData> {
    constructor(bot: Bot) {
        super('auto_moderation_rule_execution', bot);
    }

    handler = (/*eventData: AutoModExecuteData*/) => {
        // TODO: feature that adds additional automod actions for certain rules?
    }
}