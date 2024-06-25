import type Bot from '../structures/bot.js';
import { DURATION_UNITS, INTERACTION_CALLBACK_TYPES } from '../types/numberTypes.js';
import type { Embed, Interaction, InteractionMessageResponseData, URL } from '../types/types.js';
import DiscordUtils from '../utils/discord.js';
import LangUtils from '../utils/language.js';
import TextUtils from '../utils/text.js';
import type { PendingInteractionBase } from './pending.js';

export interface ShareInteraction extends PendingInteractionBase {
    responseData: InteractionMessageResponseData;
}

export default class RestrictEmojiUtils {
    bot: Bot;

    constructor(bot: Bot) {
        this.bot = bot;
    }

    async share(interactionData: ShareInteraction, newInteraction: Interaction) {
        const inter = interactionData.interaction;
        if (!inter.guild_id) {
            this.bot.logger.debug(
                'PENDING INTERACTIONS',
                'Show in chat: Initial interaction is missing guild_id:',
                inter
            );
            return;
        }
        const author = inter.member?.user || inter.user;
        if (!author) {
            this.bot.logger.handleError('PENDING INTERACTIONS', 'Show in chat: Interaction has no author');
            return;
        }

        if (
            TextUtils.timestamp.fromSnowflake(newInteraction.id) >
            TextUtils.timestamp.fromSnowflake(inter.id) + DURATION_UNITS.MINUTE * 15
        ) {
            this.bot.logger.moduleWarn('PENDING INTERACTIONS', 'Show in chat: Interaction is too old', inter);
        }

        const respData = interactionData.responseData;
        this.bot.logger.debug('PENDING INTERACTIONS', 'Show in chat: Original response', respData);

        const usedOptions = inter.data ? LangUtils.getCommandOptionsString(inter.data) : null;
        if (!usedOptions) {
            this.bot.logger.moduleWarn('PENDING INTERACTIONS', "Show in chat: Couldn't get used options", inter);
        }
        const infoText = usedOptions
            ? LangUtils.getAndReplace('SHARE_INFO', {
                  command: `/${usedOptions}`,
                  user: DiscordUtils.user.getTag(author),
              })
            : LangUtils.getAndReplace('SHARE_INFO_GENERIC', {
                  user: DiscordUtils.user.getTag(author),
              });
        let avatarURL: URL;
        if (inter.guild_id && inter.member) {
            avatarURL = DiscordUtils.user.getAvatar(author, {
                member: inter.member,
                guild_id: inter.guild_id,
            });
        } else {
            avatarURL = DiscordUtils.user.getAvatar(author);
        }
        const shareInfo: Embed = {
            footer: {
                text: infoText,
                icon_url: avatarURL,
            },
        };
        if (respData.embeds) {
            respData.embeds.push(shareInfo);
        } else {
            respData.embeds = [shareInfo];
        }
        return this.bot.api.interaction
            .sendResponse(newInteraction, {
                type: INTERACTION_CALLBACK_TYPES.CHANNEL_MESSAGE_WITH_SOURCE,
                data: respData,
            })
            .then(() => {
                this.bot.interactionUtils.deleteItem(inter.id);
                /*return this.bot.api.interaction
                    .deleteResponse(inter)
                    .catch((err) =>
                        this.bot.logger.handleError(
                            'PENDING INTERACTIONS',
                            'Show in chat: Failed to delete ephemeral response',
                            err
                        )
                    );*/
            });
    }
}
