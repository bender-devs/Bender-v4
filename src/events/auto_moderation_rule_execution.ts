import { EventHandler } from '../data/types';
import { AutoModExecuteData, LowercaseEventName } from '../data/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class AutoModExecuteHandler extends EventHandler<AutoModExecuteData> {
    constructor(bot: Bot) {
        super(basename(__filename, '.js') as LowercaseEventName, bot);
    }

    handler = (/*eventData: AutoModExecuteData*/) => {
        // TODO: feature that adds additional automod actions for certain rules?
    }
}