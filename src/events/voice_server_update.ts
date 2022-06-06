import { EventHandler } from '../data/types';
import { VoiceServerUpdateData, LowercaseEventName } from '../data/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class VoiceServerUpdateHandler extends EventHandler<VoiceServerUpdateData> {
    constructor(bot: Bot) {
        super(basename(__filename, '.js') as LowercaseEventName, bot);
    }

    handler = (/*eventData: VoiceServerUpdateData*/) => {
        // event unused for now
    }
}