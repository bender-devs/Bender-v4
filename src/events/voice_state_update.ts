import type Bot from '../structures/bot.js';
import type { VoiceStateUpdateData } from '../types/gatewayTypes.js';
import { EventHandler } from '../types/types.js';

export default class VoiceStateUpdateHandler extends EventHandler<VoiceStateUpdateData> {
    constructor(bot: Bot) {
        super('voice_state_update', bot);
    }

    cacheHandler = (/*eventData: VoiceStateUpdateData*/) => {
        // TODO: cache voice states (used for voice kick/move commands)
    };

    handler = (/*eventData: VoiceStateUpdateData*/) => {
        // event unused for now
    };
}
