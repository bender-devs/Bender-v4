import { EventHandler } from '../types/types';
import { AutoModExecuteData, LowercaseEventName } from '../types/gatewayTypes';
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