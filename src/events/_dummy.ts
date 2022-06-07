import { EventHandler } from '../data/types';
import { EventData, LowercaseEventName } from '../data/gatewayTypes';
import Bot from '../structures/bot';

export default class DummyEventHandler<T extends EventData> extends EventHandler<T> {
    constructor(bot: Bot, name: LowercaseEventName) {
        super(name, bot);
    }

    handler = () => undefined
}