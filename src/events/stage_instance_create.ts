import { EventHandler } from '../data/types';
import { StageInstanceUpdateData, LowercaseEventName } from '../data/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class StageInstanceCreateHandler extends EventHandler<StageInstanceUpdateData> {
    constructor(bot: Bot) {
        super(basename(__filename, '.js') as LowercaseEventName, bot);
    }

    handler = (/*eventData: StageInstanceUpdateData*/) => {
        // event unused for now
    }
}