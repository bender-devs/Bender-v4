import Bot from './bot.js';
import * as types from '../types/types.js';
import APIError from './apiError.js';
import { COMMAND_TYPES, INTERACTION_CALLBACK_FLAGS, INTERACTION_CALLBACK_TYPES } from '../types/numberTypes.js';
import LangUtils from '../utils/language.js';
import { SUPPORT_SERVER } from '../data/constants.js';
import { LangKey } from '../text/languageList.js';
import { inspect } from 'util';
import { EmojiKey } from '../utils/misc.js';

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

    hideSubcommands?: boolean; // whether to hide subcommands in /help
    getDetails?(locale?: types.Locale): Promise<string>;
    run(interaction: types.Interaction): types.CommandResponse;
}

type CommandResponseEditData = string | types.MessageData;
type CommandResponseCreateData = CommandResponseEditData | types.InteractionResponseData;

export class CommandUtils {
    bot: Bot;
    name: string;
    type = COMMAND_TYPES.CHAT_INPUT;

    constructor(bot: Bot, name: string) {
        this.bot = bot;
        this.name = name;
    }

    #getMessageData(interaction: types.Interaction, content: string, emojiKey?: EmojiKey): types.MessageData {
        if (emojiKey) {
            const emoji = this.getEmoji(emojiKey, interaction);
            content = `${emoji} ${content}`;
        }
        return { content };
    }
    #getResponseData(interaction: types.Interaction, msgData: CommandResponseCreateData, emojiKey?: EmojiKey) {
        if (typeof msgData === 'string') {
            return this.#getMessageData(interaction, msgData, emojiKey) as types.InteractionResponseData;
        } else if (emojiKey && msgData.content) {
            const emoji = this.getEmoji(emojiKey, interaction);
            msgData.content = `${emoji} ${msgData.content}`;
        }
        return msgData as types.InteractionResponseData;
    }

    getEmoji(emojiKey: EmojiKey, interaction: types.Interaction) {
        return this.bot.utils.getEmoji(emojiKey, interaction);
    }

    async getLink(commandKeys: LangKey[], locale?: types.Locale) {
        const cachedCommand = await this.bot.db.command.getByName(this.name);
        if (cachedCommand) {
            return LangUtils.getCommandLink(commandKeys, cachedCommand.id);
        }
        return LangUtils.getCommandText(commandKeys, locale);
    }

    async ack(interaction: types.Interaction, ephemeral = true) {
        const flags = ephemeral ? INTERACTION_CALLBACK_FLAGS.EPHEMERAL : 0;
        return this.bot.api.interaction.sendResponse(interaction, {
            type: INTERACTION_CALLBACK_TYPES.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
            data: { flags }
        }).catch(this.handleAPIError.bind(this));
    }

    async respond(interaction: types.Interaction, msgData: CommandResponseCreateData, emojiKey?: EmojiKey, ephemeral = false, deferred = false) {
        const responseType = deferred ? INTERACTION_CALLBACK_TYPES.DEFERRED_UPDATE_MESSAGE : INTERACTION_CALLBACK_TYPES.CHANNEL_MESSAGE_WITH_SOURCE;
        const data = this.#getResponseData(interaction, msgData, emojiKey);
        data.flags = ephemeral ? INTERACTION_CALLBACK_FLAGS.EPHEMERAL : 0;
        return this.bot.api.interaction.sendResponse(interaction, {
            type: responseType,
            data
        }).catch(this.handleAPIError.bind(this));
    }

    async editResponse(interaction: types.Interaction, msgData: CommandResponseEditData, emojiKey?: EmojiKey) {
        const data = typeof msgData === 'string' ? this.#getMessageData(interaction, msgData, emojiKey) : msgData;
        if (typeof msgData !== 'string' && emojiKey && data.content){
            const emoji = this.getEmoji(emojiKey, interaction);
            data.content = `${emoji} ${data.content}`;
        }
        return this.bot.api.interaction.editResponse(interaction, data).catch(this.handleAPIError.bind(this));
    }

    async deferredResponse(interaction: types.Interaction, msgData: CommandResponseEditData, emojiKey?: EmojiKey) {
        const data = typeof msgData === 'string' ? this.#getMessageData(interaction, msgData, emojiKey) : msgData;
        if (typeof msgData !== 'string' && emojiKey && data.content){
            const emoji = this.getEmoji(emojiKey, interaction);
            data.content = `${emoji} ${data.content}`;
        }
        return this.bot.api.interaction.sendFollowup(interaction, data).catch(this.handleAPIError.bind(this));
    }

    async respondKey(interaction: types.Interaction, messageLangKey: LangKey, emojiKey?: EmojiKey, ephemeral = false) {
        const content = LangUtils.get(messageLangKey, interaction.locale);
        return this.respond(interaction, content, emojiKey, ephemeral);
    }

    async respondKeyReplace(interaction: types.Interaction, messageLangKey: LangKey, replaceMap: types.ReplaceMap, emojiKey?: EmojiKey, ephemeral = false) {
        const content = LangUtils.getAndReplace(messageLangKey, replaceMap, interaction.locale);
        return this.respond(interaction, content, emojiKey, ephemeral);
    }

    async respondMissingPermissions(interaction: types.Interaction, context: string, perms: types.PermissionName[], forUser = false) {
        const permNames = perms.map(perm => LangUtils.getPermissionName(perm, interaction.locale));
        const key: LangKey = `${forUser ? 'USER_' : ''}MISSING_${context === interaction.guild_id ? 'GUILD_' : ''}PERMISSIONS`;
        return this.respondKeyReplace(interaction, key, { context, permissions: `\`${permNames.join('`, `')}\`` }, 'WARNING', true);
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
        return this.respond(interaction, `${message}\n${supportNotice}`, 'ERROR', true);
    }
}
