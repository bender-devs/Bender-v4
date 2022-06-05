import Bot from './bot';
import * as types from '../data/types';
import APIError from './apiError';
import { INTERACTION_CALLBACK_FLAGS, INTERACTION_CALLBACK_TYPES } from '../data/numberTypes';

export interface ICommand extends types.CommandCreateData {
    bot: Bot;
    dm_permission: boolean;

    run(interaction: types.Interaction): types.CommandResponse;
    runText?(msg: types.Message, argString: string): types.CommandResponse;
}

export class CommandUtils {
    bot: Bot;
    name: string;

    constructor (bot: Bot, name: string) {
        this.bot = bot;
        this.name = name;
    }

    async respond(interaction: types.Interaction, content: string) {
        return this.bot.api.interaction.sendResponse(interaction, {
            type: INTERACTION_CALLBACK_TYPES.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content,
                flags: INTERACTION_CALLBACK_FLAGS.EPHEMERAL
            }
        }).catch((err: APIError) => {
            this.bot.logger.handleError(`COMMAND FAILED: /${this.name}`, err);
            return null;
        });
    }
}