import { EventHandler } from '../data/types';
import { ChannelPinsUpdateData, LowercaseEventName } from '../data/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class ChannelPinsUpdateHandler extends EventHandler<ChannelPinsUpdateData> {
    constructor(bot: Bot) {
        super(basename(__filename, '.js') as LowercaseEventName, bot);
    }

    handler = (/*eventData: ChannelPinsUpdateData*/) => {
        // event unused for now
    }
}