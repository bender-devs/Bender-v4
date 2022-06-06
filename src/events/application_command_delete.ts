import { EventHandler } from '../data/types';
import { CommandUpdateData, LowercaseEventName } from '../data/gatewayTypes';
import Bot from '../structures/bot';
import { basename } from 'path';

export default class CommandDeleteHandler extends EventHandler<CommandUpdateData> {
    constructor(bot: Bot) {
        super(basename(__filename, '.js') as LowercaseEventName, bot);
    }

    handler = (/*eventData: CommandUpdateData*/) => {
        // event unused for now
    }
}