import { EventHandler } from '../data/types';
import { CommandUpdateData, LowercaseEventName } from '../data/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class CommandCreateHandler extends EventHandler<CommandUpdateData> {
    constructor(bot: Bot) {
        const filename = basename(__filename, '.js');
        super(filename as LowercaseEventName, bot);
    }

    handler = (/*eventData: CommandUpdateData*/) => {
        // event unused for now
    }
}