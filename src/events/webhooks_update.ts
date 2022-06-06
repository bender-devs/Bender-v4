import { EventHandler } from '../data/types';
import { WebhooksUpdateData, LowercaseEventName } from '../data/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class WebhooksUpdateHandler extends EventHandler<WebhooksUpdateData> {
    constructor(bot: Bot) {
        super(basename(__filename, '.js') as LowercaseEventName, bot);
    }

    handler = (/*eventData: WebhooksUpdateData*/) => {
        // event unused for now
    }
}