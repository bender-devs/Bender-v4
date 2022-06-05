import { EventHandler } from '../data/types';
import { StageInstanceUpdateData, LowercaseEventName } from '../data/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class StageInstanceUpdateHandler extends EventHandler<StageInstanceUpdateData> {
    constructor(bot: Bot) {
        const filename = basename(__filename, '.js');
        super(filename as LowercaseEventName, bot);
    }

    handler = (/*eventData: StageInstanceUpdateData*/) => {
        // event unused for now
    }
}