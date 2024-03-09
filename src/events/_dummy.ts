import type Bot from '../structures/bot.js';
import type { EventData, LowercaseEventName } from '../types/gatewayTypes.js';
import { EventHandler } from '../types/types.js';

export default class DummyEventHandler<T extends EventData> extends EventHandler<T> {
    constructor(bot: Bot, name: LowercaseEventName) {
        super(name, bot);
    }

    handler = () => undefined;
}
