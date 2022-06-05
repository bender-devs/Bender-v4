import { EventHandler } from '../data/types';
import { IntegrationDeleteData, LowercaseEventName } from '../data/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class IntegrationDeleteHandler extends EventHandler<IntegrationDeleteData> {
    constructor(bot: Bot) {
        const filename = basename(__filename, '.js');
        super(filename as LowercaseEventName, bot);
    }

    handler = (/*eventData: IntegrationDeleteData*/) => {
        // event unused for now
    }
}