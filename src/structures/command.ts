import { inspect } from 'util';
import { SUPPORT_SERVER } from '../data/constants.js';
import type { LangKey } from '../text/languageList.js';
import { COMMAND_TYPES, INTERACTION_CALLBACK_FLAGS, INTERACTION_CALLBACK_TYPES } from '../types/numberTypes.js';
import type * as types from '../types/types.js';
import LangUtils from '../utils/language.js';
import type { EmojiKey } from '../utils/misc.js';
import type APIError from './apiError.js';
import type Bot from './bot.js';

// the format in which user/message commands are stored (both in files and in the database.)
export class UserOrMessageCommand {
    bot: Bot;
    name: string;
    type: COMMAND_TYPES.USER | COMMAND_TYPES.MESSAGE;
    description = '' as const;
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

type CommandResponseEditData = string | types.MessageData;
type CommandResponseMessageData = CommandResponseEditData | types.InteractionMessageResponseData;
type CommandResponseCreateData = CommandResponseMessageData | types.InteractionModalResponseData;

type SettingsResultData = {
    type: 'UPDATE' | 'RESET' | 'ENABLE' | 'DISABLE';
    result: 'SUCCESS' | 'UNNECESSARY' | 'FAILURE';
};

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
    #getResponseData(
        interaction: types.Interaction,
        msgData: CommandResponseMessageData,
        emojiKey?: EmojiKey
    ): types.InteractionMessageResponseData {
        if (typeof msgData === 'string') {
            return this.#getMessageData(interaction, msgData, emojiKey) as types.InteractionMessageResponseData;
        } else if (emojiKey && msgData.content) {
            const emoji = this.getEmoji(emojiKey, interaction);
            msgData.content = `${emoji} ${msgData.content}`;
        }
        return msgData as types.InteractionMessageResponseData;
    }

    getEmoji(emojiKey: EmojiKey, interaction: types.Interaction) {
        return this.bot.utils.getEmoji(emojiKey, interaction);
    }

    async getCachedID() {
        const cachedCommand = await this.bot.db.command.getByName(this.name);
        if (cachedCommand) {
            return cachedCommand.id;
        }
        return null;
    }
    async getLink(commandKeys: LangKey[], locale?: types.Locale) {
        const cachedID = await this.getCachedID();
        if (cachedID) {
            return LangUtils.getCommandLink(commandKeys, cachedID);
        }
        return LangUtils.getCommandText(commandKeys, locale);
    }

    async ack(interaction: types.Interaction, ephemeral = true) {
        const flags = ephemeral ? INTERACTION_CALLBACK_FLAGS.EPHEMERAL : 0;
        return this.bot.api.interaction
            .sendResponse(interaction, {
                type: INTERACTION_CALLBACK_TYPES.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
                data: { flags },
            })
            .catch(this.handleAPIError.bind(this));
    }

    async respond(
        interaction: types.Interaction,
        msgData: CommandResponseCreateData,
        emojiKey?: EmojiKey,
        ephemeral = false,
        deferred = false
    ) {
        const responseType = deferred
            ? INTERACTION_CALLBACK_TYPES.DEFERRED_UPDATE_MESSAGE
            : INTERACTION_CALLBACK_TYPES.CHANNEL_MESSAGE_WITH_SOURCE;
        const data = this.#getResponseData(interaction, msgData, emojiKey);
        data.flags = ephemeral ? INTERACTION_CALLBACK_FLAGS.EPHEMERAL : 0;
        return this.bot.api.interaction
            .sendResponse(interaction, {
                type: responseType,
                data,
            })
            .catch(this.handleAPIError.bind(this));
    }

    async respondWithModal(interaction: types.Interaction, modal: types.InteractionResponseData) {
        return this.bot.api.interaction
            .sendResponse(interaction, {
                type: INTERACTION_CALLBACK_TYPES.MODAL,
                data: modal,
            })
            .catch(this.handleAPIError.bind(this));
    }

    async editResponse(interaction: types.Interaction, msgData: CommandResponseEditData, emojiKey?: EmojiKey) {
        const data = typeof msgData === 'string' ? this.#getMessageData(interaction, msgData, emojiKey) : msgData;
        if (typeof msgData !== 'string' && emojiKey && data.content) {
            const emoji = this.getEmoji(emojiKey, interaction);
            data.content = `${emoji} ${data.content}`;
        }
        return this.bot.api.interaction.editResponse(interaction, data).catch(this.handleAPIError.bind(this));
    }

    async deferredResponse(interaction: types.Interaction, msgData: CommandResponseEditData, emojiKey?: EmojiKey) {
        const data = typeof msgData === 'string' ? this.#getMessageData(interaction, msgData, emojiKey) : msgData;
        if (typeof msgData !== 'string' && emojiKey && data.content) {
            const emoji = this.getEmoji(emojiKey, interaction);
            data.content = `${emoji} ${data.content}`;
        }
        return this.bot.api.interaction.sendFollowup(interaction, data).catch(this.handleAPIError.bind(this));
    }

    async respondKey(
        interaction: types.Interaction,
        messageLangKey: LangKey,
        emojiKey?: EmojiKey,
        ephemeral = false
    ) {
        const content = LangUtils.get(messageLangKey, interaction.locale);
        return this.respond(interaction, content, emojiKey, ephemeral);
    }

    async respondKeyReplace(
        interaction: types.Interaction,
        messageLangKey: LangKey,
        replaceMap: types.ReplaceMap,
        emojiKey?: EmojiKey,
        ephemeral = false
    ) {
        const content = LangUtils.getAndReplace(messageLangKey, replaceMap, interaction.locale);
        return this.respond(interaction, content, emojiKey, ephemeral);
    }

    async respondMissingPermissions(
        interaction: types.Interaction,
        context: string,
        perms: types.PermissionName[],
        forUser = false
    ) {
        const permNames = perms.map((perm) => LangUtils.getPermissionName(perm, interaction.locale));
        const key: LangKey = `${forUser ? 'USER_' : ''}MISSING_${
            context === interaction.guild_id ? 'GUILD_' : ''
        }PERMISSIONS`;
        return this.respondKeyReplace(
            interaction,
            key,
            { context, permissions: `\`${permNames.join('`, `')}\`` },
            'WARNING',
            true
        );
    }

    async respondSettingsResult(
        interaction: types.Interaction,
        settingKey: LangKey,
        data: SettingsResultData,
        value?: string
    ) {
        if (data.result === 'FAILURE') {
            return this.respondKeyReplace(
                interaction,
                `SETTING_${data.type}_FAILED`,
                {
                    setting: LangUtils.get(settingKey, interaction.locale),
                },
                'ERROR',
                true
            );
        }
        let genericSettingKey: LangKey;
        if (value && data.type === 'UPDATE') {
            genericSettingKey = `SETTING_${data.type}_${data.result}_VALUE`;
        } else {
            genericSettingKey = `SETTING_${data.type}_${data.result}`;
        }
        const replyText = LangUtils.getAndReplace(
            genericSettingKey,
            {
                setting: LangUtils.get(settingKey, interaction.locale),
                value: value || '',
            },
            interaction.locale
        );
        return this.respond(interaction, replyText, `SUCCESS${data.result === 'UNNECESSARY' ? '_ALT' : ''}`);
    }

    async handleAPIError(err: APIError) {
        this.bot.logger.handleError(`COMMAND FAILED: /${this.name}`, err);
        return null;
    }

    async handleUnexpectedError(interaction: types.Interaction, messageLangKey: LangKey) {
        const args = interaction.data?.options;
        const message = LangUtils.get(messageLangKey, interaction.locale);
        const supportNotice = LangUtils.getAndReplace('INTERACTION_ERROR_NOTICE', {
            invite: SUPPORT_SERVER,
        });
        this.bot.logger.handleError(`COMMAND FAILED: /${this.name}`, message);
        this.bot.logger.debug(`Arguments passed to /${this.name}:`, inspect(args, false, 69, true));
        return this.respond(interaction, `${message}\n${supportNotice}`, 'ERROR', true);
    }
}

export interface SlashCommand extends types.CommandBase {
    bot: Bot;
    type: COMMAND_TYPES.CHAT_INPUT;
    name: string;
    description: string;
    dm_permission: boolean;

    /** whether to hide subcommands in /help */
    hideSubcommands?: boolean;
    getDetails?(locale?: types.Locale): Promise<string>;
    run(interaction: types.Interaction): types.CommandResponse;
}

// merge CommandUtils class and SlashCommand interface to create a class that can be extended
export abstract class SlashCommand extends CommandUtils {}
