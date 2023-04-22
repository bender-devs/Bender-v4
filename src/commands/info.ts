import { ICommand, CommandUtils } from '../structures/command';
import Bot from '../structures/bot';
import { CommandOption, CommandResponse, Interaction } from '../types/types';
import { COMMAND_OPTION_TYPES } from '../types/numberTypes';
import LangUtils from '../utils/language';

import userInfo from './info/user';
import emojiInfo from './info/emoji';
import channelInfo from './info/channel';
import bannerInfo from './info/banner';
import inviteInfo from './info/invite';
import serverInfo from './info/server';
import avatarInfo from './info/avatar';
import botInfo from './info/bot';
import charInfo from './info/char';

export default class InfoCommand extends CommandUtils implements ICommand {
    constructor(bot: Bot) {
        super(bot, LangUtils.get('INFO_NAME'));
    }
    readonly name_localizations = LangUtils.getLocalizationMap('INFO_NAME');

    readonly description = LangUtils.get('INFO_DESCRIPTION');
    readonly description_localizations = LangUtils.getLocalizationMap('INFO_DESCRIPTION');

    readonly dm_permission: boolean = true;

    readonly options: CommandOption[] = [{
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,

        name: LangUtils.get('BOT_INFO_SUBCOMMAND'),
        name_localizations: LangUtils.getLocalizationMap('BOT_INFO_SUBCOMMAND'),

        description: LangUtils.get('BOT_INFO_SUBCOMMAND_DESCRIPTION'),
        description_localizations: LangUtils.getLocalizationMap('BOT_INFO_SUBCOMMAND_DESCRIPTION')
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,

        name: LangUtils.get('USER_INFO_SUBCOMMAND'),
        name_localizations: LangUtils.getLocalizationMap('USER_INFO_SUBCOMMAND'),

        description: LangUtils.get('USER_INFO_SUBCOMMAND_DESCRIPTION'),
        description_localizations: LangUtils.getLocalizationMap('USER_INFO_SUBCOMMAND_DESCRIPTION'),

        options: [{
            type: COMMAND_OPTION_TYPES.USER,

            name: LangUtils.get('USER_INFO_OPTION'),
            name_localizations: LangUtils.getLocalizationMap('USER_INFO_OPTION'),

            description: LangUtils.get('USER_INFO_OPTION_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('USER_INFO_OPTION_DESCRIPTION'),

            required: true
        }]
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,

        name: LangUtils.get('CHANNEL_INFO_SUBCOMMAND'),
        name_localizations: LangUtils.getLocalizationMap('CHANNEL_INFO_SUBCOMMAND'),

        description: LangUtils.get('CHANNEL_INFO_SUBCOMMAND_DESCRIPTION'),
        description_localizations: LangUtils.getLocalizationMap('CHANNEL_INFO_SUBCOMMAND_DESCRIPTION'),

        options: [{
            type: COMMAND_OPTION_TYPES.CHANNEL,

            name: LangUtils.get('CHANNEL_INFO_OPTION'),
            name_localizations: LangUtils.getLocalizationMap('CHANNEL_INFO_OPTION'),

            description: LangUtils.get('CHANNEL_INFO_OPTION_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('CHANNEL_INFO_OPTION_DESCRIPTION'),

            required: true
        }]
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,

        name: LangUtils.get('SERVER_INFO_SUBCOMMAND'),
        name_localizations: LangUtils.getLocalizationMap('SERVER_INFO_SUBCOMMAND'),

        description: LangUtils.get('SERVER_INFO_SUBCOMMAND_DESCRIPTION'),
        description_localizations: LangUtils.getLocalizationMap('SERVER_INFO_SUBCOMMAND_DESCRIPTION')
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,

        name: LangUtils.get('EMOJI_INFO_SUBCOMMAND'),
        name_localizations: LangUtils.getLocalizationMap('EMOJI_INFO_SUBCOMMAND'),

        description: LangUtils.get('EMOJI_INFO_SUBCOMMAND_DESCRIPTION'),
        description_localizations: LangUtils.getLocalizationMap('EMOJI_INFO_SUBCOMMAND_DESCRIPTION'),

        options: [{
            type: COMMAND_OPTION_TYPES.STRING,

            name: LangUtils.get('EMOJI_INFO_OPTION'),
            name_localizations: LangUtils.getLocalizationMap('EMOJI_INFO_OPTION'),

            description: LangUtils.get('EMOJI_INFO_OPTION_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('EMOJI_INFO_OPTION_DESCRIPTION'),

            required: true
        }]
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,

        name: LangUtils.get('AVATAR_INFO_SUBCOMMAND'),
        name_localizations: LangUtils.getLocalizationMap('AVATAR_INFO_SUBCOMMAND'),

        description: LangUtils.get('AVATAR_INFO_SUBCOMMAND_DESCRIPTION'),
        description_localizations: LangUtils.getLocalizationMap('AVATAR_INFO_SUBCOMMAND_DESCRIPTION'),

        options: [{
            type: COMMAND_OPTION_TYPES.USER,

            name: LangUtils.get('AVATAR_INFO_OPTION'),
            name_localizations: LangUtils.getLocalizationMap('AVATAR_INFO_OPTION'),

            description: LangUtils.get('AVATAR_INFO_OPTION_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('AVATAR_INFO_OPTION_DESCRIPTION')
        }]
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,

        name: LangUtils.get('BANNER_INFO_SUBCOMMAND'),
        name_localizations: LangUtils.getLocalizationMap('BANNER_INFO_SUBCOMMAND'),

        description: LangUtils.get('BANNER_INFO_SUBCOMMAND_DESCRIPTION'),
        description_localizations: LangUtils.getLocalizationMap('BANNER_INFO_SUBCOMMAND_DESCRIPTION'),

        options: [{
            type: COMMAND_OPTION_TYPES.USER,

            name: LangUtils.get('BANNER_INFO_OPTION'),
            name_localizations: LangUtils.getLocalizationMap('BANNER_INFO_OPTION'),

            description: LangUtils.get('BANNER_INFO_OPTION_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('BANNER_INFO_OPTION_DESCRIPTION')
        }]
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,

        name: LangUtils.get('INVITE_INFO_SUBCOMMAND'),
        name_localizations: LangUtils.getLocalizationMap('INVITE_INFO_SUBCOMMAND'),

        description: LangUtils.get('INVITE_INFO_SUBCOMMAND_DESCRIPTION'),
        description_localizations: LangUtils.getLocalizationMap('INVITE_INFO_SUBCOMMAND_DESCRIPTION'),

        options: [{
            type: COMMAND_OPTION_TYPES.STRING,

            name: LangUtils.get('INVITE_INFO_OPTION'),
            name_localizations: LangUtils.getLocalizationMap('INVITE_INFO_OPTION'),

            description: LangUtils.get('INVITE_INFO_OPTION_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('INVITE_INFO_OPTION_DESCRIPTION'),

            required: true
        }]
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,

        name: LangUtils.get('CHAR_INFO_SUBCOMMAND'),
        name_localizations: LangUtils.getLocalizationMap('CHAR_INFO_SUBCOMMAND'),

        description: LangUtils.get('CHAR_INFO_SUBCOMMAND_DESCRIPTION'),
        description_localizations: LangUtils.getLocalizationMap('CHAR_INFO_SUBCOMMAND_DESCRIPTION'),

        options: [{
            type: COMMAND_OPTION_TYPES.STRING,

            name: LangUtils.get('CHAR_INFO_OPTION'),
            name_localizations: LangUtils.getLocalizationMap('CHAR_INFO_OPTION'),

            description: LangUtils.get('CHAR_INFO_OPTION_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('CHAR_INFO_OPTION_DESCRIPTION'),

            required: true
        }]
    }];

    run(interaction: Interaction): CommandResponse {
        const args = interaction.data?.options;
        const subcommand = args?.[0]?.name;
        const target = args?.[0]?.options?.[0]?.value;
        switch (subcommand) {
            case LangUtils.get('USER_INFO_SUBCOMMAND'):
                return userInfo.bind(this)(interaction, target);
            case LangUtils.get('EMOJI_INFO_SUBCOMMAND'):
                return emojiInfo.bind(this)(interaction, target);
            case LangUtils.get('CHANNEL_INFO_SUBCOMMAND'):
                return channelInfo.bind(this)(interaction, target);
            case LangUtils.get('BANNER_INFO_SUBCOMMAND'):
                return bannerInfo.bind(this)(interaction, target);
            case LangUtils.get('INVITE_INFO_SUBCOMMAND'):
                return inviteInfo.bind(this)(interaction, target);
            case LangUtils.get('SERVER_INFO_SUBCOMMAND'):
                return serverInfo.bind(this)(interaction);
            case LangUtils.get('AVATAR_INFO_SUBCOMMAND'):
                return avatarInfo.bind(this)(interaction, target);
            case LangUtils.get('BOT_INFO_SUBCOMMAND'):
                return botInfo.bind(this)(interaction);
            case LangUtils.get('CHAR_INFO_SUBCOMMAND'):
                return charInfo.bind(this)(interaction, target);
        }
        return this.handleUnexpectedError(interaction, 'INVALID_SUBCOMMAND');
    }
}