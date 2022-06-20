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

        name: 'user',
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

        name: 'emoji',
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

        name: 'channel',
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

        name: 'banner',
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

        name: 'invite',
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

        name: 'server',
        name_localizations: LangUtils.getLocalizationMap('SERVER_INFO_SUBCOMMAND'),

        description: LangUtils.get('SERVER_INFO_SUBCOMMAND_DESCRIPTION'),
        description_localizations: LangUtils.getLocalizationMap('SERVER_INFO_SUBCOMMAND_DESCRIPTION')
    }];

    run(interaction: Interaction): CommandResponse {
        const args = interaction.data?.options;
        const subcommand = args?.[0]?.name;
        const target = args?.[0]?.options?.[0]?.value;
        switch (subcommand) {
            case 'user':
                return userInfo.bind(this)(interaction, target);
            case 'emoji':
                return emojiInfo.bind(this)(interaction, target);
            case 'channel':
                return channelInfo.bind(this)(interaction, target);
            case 'banner':
                return bannerInfo.bind(this)(interaction, target);
            case 'invite':
                return inviteInfo.bind(this)(interaction, target);
            case 'server':
                return serverInfo.bind(this)(interaction);
        }
        return this.handleUnexpectedError(interaction, 'INVALID_SUBCOMMAND');
    }
}