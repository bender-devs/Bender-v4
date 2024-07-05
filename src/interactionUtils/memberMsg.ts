import type Bot from '../structures/bot.js';
import type { GuildBulkUpdate } from '../types/dbTypes.js';
import { MESSAGE_COMPONENT_TYPES } from '../types/numberTypes.js';
import type { Interaction, TextInput } from '../types/types.js';
import LangUtils from '../utils/language.js';
import type { PendingInteractionBase } from './pending.js';

export interface MemberMsgInteraction extends PendingInteractionBase {
    dm: boolean;
}

export default class MemberMsgUtils {
    bot: Bot;

    constructor(bot: Bot) {
        this.bot = bot;
    }

    async submit(interactionData: MemberMsgInteraction, newInteraction: Interaction) {
        const inter = interactionData.interaction;
        if (!('guild_id' in inter)) {
            this.bot.logger.debug(
                'PENDING INTERACTIONS',
                '[Member messages]',
                'Initial interaction is missing guild_id:',
                inter
            );
            return;
        }
        const modalID = newInteraction.data?.custom_id;
        if (!modalID) {
            this.bot.logger.debug(
                'PENDING INTERACTIONS',
                '[Member messages]',
                'Interaction modal is missing custom_id:',
                newInteraction
            );
            return;
        }
        if (!newInteraction.data?.components) {
            this.bot.logger.debug(
                'PENDING INTERACTIONS',
                '[Member messages]',
                'Interaction modal is missing components:',
                newInteraction
            );
            return;
        }
        const textComponents: TextInput[] = [];
        for (const row of newInteraction.data.components) {
            if (row.type === MESSAGE_COMPONENT_TYPES.ACTION_ROW) {
                for (const component of row.components) {
                    if (component.type === MESSAGE_COMPONENT_TYPES.TEXT_INPUT) {
                        textComponents.push(component);
                    }
                }
            }
        }

        let updateObj: GuildBulkUpdate = {};
        if (modalID.endsWith('_dm')) {
            const joinDM = textComponents.find((component) => component.custom_id.endsWith('_join-dm'));
            const kickDM = textComponents.find((component) => component.custom_id.endsWith('_kick-dm'));
            const banDM = textComponents.find((component) => component.custom_id.endsWith('_ban-dm'));
            updateObj = {
                'memberLog.joinDM': joinDM?.value,
                'memberLog.kickDM': kickDM?.value,
                'memberLog.banDM': banDM?.value,
            };
        } else {
            const join = textComponents.find((component) => component.custom_id.endsWith('_join'));
            const leave = textComponents.find((component) => component.custom_id.endsWith('_leave'));
            const ban = textComponents.find((component) => component.custom_id.endsWith('_ban'));
            updateObj = {
                'memberLog.join': join?.value,
                'memberLog.leave': leave?.value,
                'memberLog.ban': ban?.value,
            };
        }
        let respText = '';
        await this.bot.db.guild
            .bulkUpdate(inter.guild_id, updateObj)
            .then((result) => {
                respText = LangUtils.getAndReplace(
                    `SETTING_UPDATE_${result.changes ? 'SUCCESS' : 'UNNECESSARY'}`,
                    {
                        setting: LangUtils.get(
                            `MEMBER_MSG_SETTING_${modalID.endsWith('_dm') ? 'DMS' : 'MESSAGES'}`,
                            inter.locale
                        ),
                    },
                    inter.locale
                );
                respText = `${this.bot.utils.getEmoji(
                    `SUCCESS${result.changes ? '' : '_ALT'}`,
                    inter
                )} ${respText}`;
            })
            .catch((err) => {
                this.bot.logger.handleError('PENDING INTERACTIONS', '[Member messages]', err);
                respText = LangUtils.getAndReplace(
                    'SETTING_UPDATE_UNNECESSARY',
                    { setting: LangUtils.get('MEMBER_MSG_SETTING_MESSAGES', inter.locale) },
                    inter.locale
                );
                respText = `${this.bot.utils.getEmoji('ERROR', inter)} ${respText}`;
            });

        this.bot.interactionUtils.deleteItem(inter.id);
        return this.bot.api.interaction.sendResponseMessage(newInteraction, { content: respText, components: [] });
    }
}
