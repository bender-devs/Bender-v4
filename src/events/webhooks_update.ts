import { EventHandler } from '../data/types';
import { WebhooksUpdateData, LowercaseEventName } from '../data/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class WebhooksUpdateHandler extends EventHandler<WebhooksUpdateData> {
    constructor(bot: Bot) {
        const filename = basename(__filename, '.js');
        super(filename as LowercaseEventName, bot);
    }

    handler = (/*eventData: WebhooksUpdateData*/) => {
        // event unused for now
    }
}