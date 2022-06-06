import { EventHandler } from '../data/types';
import { VoiceStateUpdateData, LowercaseEventName } from '../data/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class VoiceStateUpdateHandler extends EventHandler<VoiceStateUpdateData> {
    constructor(bot: Bot) {
        super(basename(__filename, '.js') as LowercaseEventName, bot);
    }

    cacheHandler = (/*eventData: VoiceStateUpdateData*/) => {
        // TODO: cache voice states (used for voice kick/move commands)
    }

    handler = (/*eventData: VoiceStateUpdateData*/) => {
        // event unused for now
    }
}