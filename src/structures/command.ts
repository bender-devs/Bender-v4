import Bot from './bot';
import * as types from '../types/types';
import APIError from './apiError';
import { COMMAND_TYPES, INTERACTION_CALLBACK_FLAGS, INTERACTION_CALLBACK_TYPES, PERMISSIONS } from '../types/numberTypes';
import LangUtils from '../utils/language';
import { SUPPORT_SERVER } from '../data/constants';
import { LangKey } from '../text/languageList';
import { inspect } from 'util';
import { EmojiKey } from '../utils/misc';

// the format in which user/message commands are stored (both in files and in the database.)
export class UserOrMessageCommand {
    bot: Bot;
    name: string;
    type: COMMAND_TYPES.USER | COMMAND_TYPES.MESSAGE;
    description: '' = '';
    run: (interaction: types.Interaction) => types.CommandResponse;

    constructor(bot: Bot, name: string, run: UserOrMessageCommand['run'], type: UserOrMessageCommand['type']) {
        this.bot = bot;
        this.name = name;
        this.run = run;
        this.type = type;
    }
}
export class UserCommand extends UserOrMessageCommand {
    constructor(bot: Bot, name: string, run: UserOrMessageCommand['run']) {
        super(bot, name, run, COMMAND_TYPES.USER);
    }
}
export class MessageCommand extends UserOrMessageCommand {
    constructor(bot: Bot, name: string, run: UserOrMessageCommand['run']) {
        super(bot, name, run, COMMAND_TYPES.MESSAGE);
    }
}

export interface ICommand extends types.CommandCreateData {
    bot: Bot;
    dm_permission: boolean;

    run(interaction: types.Interaction): types.CommandResponse;
}

export class CommandUtils {
    bot: Bot;
    name: string;
    type = COMMAND_TYPES.CHAT_INPUT;

    constructor(bot: Bot, name: string) {
        this.bot = bot;
        this.name = name;
    }

    #getMessageData(interaction: types.Interaction, content: string | types.Embed, emojiKey?: EmojiKey): types.MessageData {
        if (typeof content === 'string') {
            if (emojiKey) {
                const emoji = this.getEmoji(emojiKey, interaction);
                content = `${emoji} ${content}`;
            }
            return { content };
        }
        return { embeds: [content] }
    }
    #getResponseData(interaction: types.Interaction, content: string | types.Embed, emojiKey?: EmojiKey) {
        return this.#getMessageData(interaction, content, emojiKey) as types.InteractionResponseData;
    }

    getEmoji(emojiKey: EmojiKey, interaction: types.Interaction) {
        return this.bot.utils.getEmoji(emojiKey, interaction);
    }

    async ack(interaction: types.Interaction, ephemeral = true) {
        const flags = ephemeral ? INTERACTION_CALLBACK_FLAGS.EPHEMERAL : 0;
        return this.bot.api.interaction.sendResponse(interaction, {
            type: INTERACTION_CALLBACK_TYPES.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
            data: { flags }
        }).catch(this.handleAPIError.bind(this));
    }

    async respond(interaction: types.Interaction, content: string | types.Embed, emojiKey?: EmojiKey, ephemeral = true, deferred = false) {
        const responseType = deferred ? INTERACTION_CALLBACK_TYPES.DEFERRED_UPDATE_MESSAGE : INTERACTION_CALLBACK_TYPES.CHANNEL_MESSAGE_WITH_SOURCE;
        const data = this.#getResponseData(interaction, content, emojiKey);
        data.flags = ephemeral ? INTERACTION_CALLBACK_FLAGS.EPHEMERAL : 0;
        return this.bot.api.interaction.sendResponse(interaction, {
            type: responseType,
            data
        }).catch(this.handleAPIError.bind(this));
    }

    async editResponse(interaction: types.Interaction, content: string | types.Embed, emojiKey?: EmojiKey) {
        const data = this.#getMessageData(interaction, content, emojiKey);
        return this.bot.api.interaction.editResponse(interaction, data).catch(this.handleAPIError.bind(this));
    }

    async deferredResponse(interaction: types.Interaction, content: string | types.Embed, emojiKey?: EmojiKey) {
        const data = this.#getMessageData(interaction, content, emojiKey);
        return this.bot.api.interaction.sendFollowup(interaction, data).catch(this.handleAPIError.bind(this));
    }

    async respondKey(interaction: types.Interaction, messageLangKey: LangKey, emojiKey?: EmojiKey) {
        const content = LangUtils.get(messageLangKey, interaction.locale);
        return this.respond(interaction, content, emojiKey);
    }

    async respondKeyReplace(interaction: types.Interaction, messageLangKey: LangKey, replaceMap: types.ReplaceMap, emojiKey?: EmojiKey) {
        const content = LangUtils.getAndReplace(messageLangKey, replaceMap, interaction.locale);
        return this.respond(interaction, content, emojiKey);
    }

    async respondMissingPermissions(interaction: types.Interaction, context: string, perms: PERMISSIONS[], forUser = false) {
        const permNames = perms.map(perm => LangUtils.getFriendlyPermissionName(perm, interaction.locale));
        const key: LangKey = `${forUser ? 'USER_' : ''}MISSING_${context === interaction.guild_id ? 'GUILD_' : ''}PERMISSIONS`;
        return this.respondKeyReplace(interaction, key, { context, permissions: permNames.join(', ') }, 'WARNING');
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
        this.bot.logger.debug(`Arguments passed to /${this.name}:`, inspect(args, false, 69, true));
        return this.respond(interaction, `❌ ${message}\n${supportNotice}`);
    }
}
