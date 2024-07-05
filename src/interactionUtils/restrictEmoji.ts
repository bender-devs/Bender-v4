import type Bot from '../structures/bot.js';
import type { Emoji, Interaction, Snowflake } from '../types/types.js';
import LangUtils from '../utils/language.js';
import TextUtils from '../utils/text.js';
import type { PendingInteractionBase } from './pending.js';

export interface RestrictEmojiInteraction extends PendingInteractionBase {
    emoji: Emoji;
    emojiText: string;
}

export default class RestrictEmojiUtils {
    bot: Bot;

    constructor(bot: Bot) {
        this.bot = bot;
    }

    async submitRoles(interactionData: RestrictEmojiInteraction, newInteraction: Interaction) {
        const inter = interactionData.interaction;
        if (!('guild_id' in inter)) {
            this.bot.logger.debug(
                'PENDING INTERACTIONS',
                'Restrict emoji: Initial interaction is missing guild_id:',
                inter
            );
            return;
        }
        const values = newInteraction.data?.values as Snowflake[] | undefined;
        if (!values?.length) {
            this.bot.logger.debug(
                'PENDING INTERACTIONS',
                'Restrict emoji interaction is missing values:',
                newInteraction
            );
            return;
        }
        let respText = '';
        await this.bot.api.emoji
            .edit(inter.guild_id, interactionData.emoji.id, { roles: values })
            .then((newEmoji) => {
                if (newEmoji) {
                    respText = LangUtils.getAndReplace(
                        'REM_SET_ROLES',
                        {
                            emoji: interactionData.emojiText,
                            roles: values.map((id) => TextUtils.mention.parseRole(id)).join(', '),
                        },
                        inter.locale
                    );
                    respText = `${this.bot.utils.getEmoji('SUCCESS', inter)} ${respText}`;
                } else {
                    respText = LangUtils.getAndReplace(
                        'REM_SET_ROLES_UNNECESSARY',
                        { emoji: interactionData.emojiText },
                        inter.locale
                    );
                    respText = `${this.bot.utils.getEmoji('SUCCESS_ALT', inter)} ${respText}`;
                }
            })
            .catch((err) => {
                this.bot.logger.handleError('/restrict-emoji', err);
                respText = LangUtils.getAndReplace(
                    'REM_EDIT_FAILED',
                    { emoji: interactionData.emojiText },
                    inter.locale
                );
                respText = `${this.bot.utils.getEmoji('WARNING', inter)} ${respText}`;
            });

        this.bot.interactionUtils.deleteItem(inter.id);
        return this.bot.api.interaction.editResponse(inter, { content: respText, components: [] });
    }
}
