import type Bot from '../structures/bot.js';
import type { LangKey } from '../text/languageList.js';
import type { Interaction, Snowflake } from '../types/types.js';
import LangUtils from '../utils/language.js';
import TextUtils from '../utils/text.js';
import type { PendingInteractionBase } from './pending.js';

export interface InactiveStatsInteraction extends PendingInteractionBase {
    days: number;
}

export default class RestrictEmojiUtils {
    bot: Bot;

    constructor(bot: Bot) {
        this.bot = bot;
    }

    async submitRoles(interactionData: InactiveStatsInteraction, newInteraction: Interaction) {
        const inter = interactionData.interaction;
        if (!('guild_id' in inter)) {
            this.bot.logger.debug(
                'PENDING INTERACTIONS',
                'Inactive stats: Initial interaction is missing guild_id:',
                inter
            );
            return;
        }
        const values = newInteraction.data?.values as Snowflake[] | undefined;
        if (!values?.length) {
            this.bot.logger.debug(
                'PENDING INTERACTIONS',
                'Inactive stats interaction is missing values:',
                newInteraction
            );
            return;
        }

        return this.bot.api.guild
            .fetchPruneCount(inter.guild_id, interactionData.days, values)
            .then((result) => {
                const inactive = result?.pruned;
                if (typeof inactive !== 'number') {
                    throw new Error(`fetchPruneCount failed; inactive = ${inactive}`);
                }

                const resultKey: LangKey = `STATS_INACTIVE_RESULT${interactionData.days === 1 ? '_1DAY' : ''}${
                    inactive === 1 ? '_SINGLE' : ''
                }`;
                let respText = LangUtils.getAndReplace(
                    resultKey,
                    { inactive, days: interactionData.days },
                    inter.locale
                );
                const rolesText = LangUtils.getAndReplace(
                    'STATS_INACTIVE_ROLES_INCLUDED',
                    {
                        roles: values.map((id) => TextUtils.mention.parseRole(id)).join(', '),
                    },
                    inter.locale
                );
                respText = `${this.bot.utils.getEmoji('INFO', inter)} ${respText}\n${rolesText}`;

                this.bot.interactionUtils.deleteItem(inter.id);
                return this.bot.api.interaction.editResponse(inter, { content: respText, components: [] });
            })
            .catch((err) => {
                this.bot.logger.handleError('/stats inactive', err);
                let failedText = LangUtils.get('STATS_INACTIVE_FETCH_FAILED', inter.locale);
                failedText = `${this.bot.utils.getEmoji('WARNING', inter)} ${failedText}`;

                this.bot.interactionUtils.deleteItem(inter.id);
                return this.bot.api.interaction.editResponse(inter, { content: failedText, components: [] });
            });
    }
}
