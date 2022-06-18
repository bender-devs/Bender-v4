import Bot from './bot';
import * as types from '../types/types';
import APIError from './apiError';
import { INTERACTION_CALLBACK_FLAGS, INTERACTION_CALLBACK_TYPES, MESSAGE_FLAGS, PERMISSIONS } from '../types/numberTypes';
import LangUtils from '../utils/language';
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

    async ack(interaction: types.Interaction) {
        return this.bot.api.interaction.sendResponse(interaction, {
            type: INTERACTION_CALLBACK_TYPES.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE
        }).catch(this.handleAPIError.bind(this));
    }

    async respond(interaction: types.Interaction, content: string | types.Embed, ephemeral = true, deferred = false) {
        const responseType = deferred ? INTERACTION_CALLBACK_TYPES.DEFERRED_UPDATE_MESSAGE : INTERACTION_CALLBACK_TYPES.CHANNEL_MESSAGE_WITH_SOURCE;
        const flags = ephemeral ? INTERACTION_CALLBACK_FLAGS.EPHEMERAL : 0;
        const data: types.InteractionResponseData = { flags };
        if (typeof content === 'string') {
            data.content = content;
        } else {
            data.embeds = [content];
        }
        return this.bot.api.interaction.sendResponse(interaction, {
            type: responseType,
            data
        }).catch(this.handleAPIError.bind(this));
    }

    async editResponse(interaction: types.Interaction, content: string | types.Embed, ephemeral = true) {
        const flags = ephemeral ? MESSAGE_FLAGS.EPHEMERAL : 0;
        const data: types.MessageData = { flags };
        if (typeof content === 'string') {
            data.content = content;
        } else {
            data.embeds = [content];
        }
        return this.bot.api.interaction.sendFollowup(interaction, data).catch(this.handleAPIError.bind(this));
    }

    async respondKey(interaction: types.Interaction, messageLangKey: LangKey) {
        const content = LangUtils.get(messageLangKey, interaction.locale);
        return this.respond(interaction, content);
    }

    async respondKeyReplace(interaction: types.Interaction, messageLangKey: LangKey, replaceMap: types.ReplaceMap) {
        const content = LangUtils.getAndReplace(messageLangKey, replaceMap, interaction.locale);
        return this.respond(interaction, content);
    }

    async respondMissingPermissions(interaction: types.Interaction, context: string, perms: PERMISSIONS[], forUser = false) {
        const permNames = perms.map(perm => LangUtils.getFriendlyPermissionName(perm, interaction.locale));
        const key: LangKey = `${forUser ? 'USER_' : ''}MISSING_${context === interaction.guild_id ? 'GUILD_' : ''}PERMISSIONS`;
        return this.respondKeyReplace(interaction, key, { context, permissions: permNames.join(', ') });
    }

    async handleAPIError(err: APIError) {
        this.bot.logger.handleError(`COMMAND FAILED: /${this.name}`, err);
        return null;
    }

    async handleUnexpectedError(interaction: types.Interaction, messageLangKey: LangKey) {
        const args = interaction.data?.options;
        const message = LangUtils.get(messageLangKey, interaction.locale);
        const supportNotice = LangUtils.getAndReplace('INTERACTION_ERROR_NOTICE', {
            invite: SUPPORT_SERVER
        });
        this.bot.logger.handleError(`COMMAND FAILED: /${this.name}`, message);
        this.bot.logger.debug(`Arguments passed to /${this.name}:`, inspect(args, false, 69));
        return this.respond(interaction, `❌ ${message}\n${supportNotice}`);
    }
}
