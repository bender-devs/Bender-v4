import { EventHandler } from '../data/types';
import { IntegrationUpdateData, LowercaseEventName } from '../data/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class IntegrationCreateHandler extends EventHandler<IntegrationUpdateData> {
    constructor(bot: Bot) {
        const filename = basename(__filename, '.js');
        super(filename as LowercaseEventName, bot);
    }

    handler = (/*eventData: IntegrationUpdateData*/) => {
        // event unused for now
    }
}