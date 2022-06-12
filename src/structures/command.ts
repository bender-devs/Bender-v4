import Bot from './bot';
import * as types from '../data/types';
import APIError from './apiError';
import { INTERACTION_CALLBACK_FLAGS, INTERACTION_CALLBACK_TYPES } from '../data/numberTypes';
import LanguageUtils from '../utils/language';
import { SUPPORT_SERVER } from '../data/constants';
import { LangKey } from '../text/languageList';
import { inspect } from 'util';

export interface ICommand extends types.CommandCreateData {
    bot: Bot;
    dm_permission: boolean;

    run(interaction: types.Interaction): types.CommandResponse;
}

export class CommandUtils {
    bot: Bot;
    name: string;

    constructor(bot: Bot, name: string) {
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
        }).catch(this.handleAPIError.bind(this));
    }

    async respondEmbed(interaction: types.Interaction, embed: types.Embed) {
        return this.bot.api.interaction.sendResponse(interaction, {
            type: INTERACTION_CALLBACK_TYPES.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                embeds: [embed],
                flags: INTERACTION_CALLBACK_FLAGS.EPHEMERAL
            }
        }).catch(this.handleAPIError.bind(this));
    }

    async handleAPIError(err: APIError) {
        this.bot.logger.handleError(`COMMAND FAILED: /${this.name}`, err);
        return null;
    }

    async handleUnexpectedError(interaction: types.Interaction, messageLangKey: LangKey) {
        const args = interaction.data?.options;
        const message = LanguageUtils.getAndReplace(messageLangKey, {}, interaction.locale);
        const supportNotice = LanguageUtils.getAndReplace('INTERACTION_ERROR_NOTICE', {
            invite: SUPPORT_SERVER
        });
        this.bot.logger.handleError(`COMMAND FAILED: /${this.name}`, message);
        this.bot.logger.debug(`Arguments passed to /${this.name}:`, inspect(args, false, 69));
        return this.respond(interaction, `❌ ${message}\n${supportNotice}`);
    }
}
