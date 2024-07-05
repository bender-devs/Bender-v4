import type Bot from '../structures/bot.js';
import {
    BUTTON_STYLES,
    INTERACTION_CALLBACK_FLAGS,
    INTERACTION_CALLBACK_TYPES,
    MESSAGE_COMPONENT_TYPES,
} from '../types/numberTypes.js';
import type { Interaction, Locale, MessageComponent, Snowflake } from '../types/types.js';
import LangUtils from '../utils/language.js';
import MiscUtils from '../utils/misc.js';
import TextUtils from '../utils/text.js';
import type { PendingInteractionBase } from './pending.js';

export interface RockPaperScissorsInteraction extends PendingInteractionBase {
    target: Snowflake;
    authorChoice?: RPSShow;
    targetChoice?: RPSShow;
}

export type RPSShow = 'r' | 'p' | 's';

export default class RPSUtils {
    bot: Bot;

    constructor(bot: Bot) {
        this.bot = bot;
    }

    static getComponents(id: Snowflake, disabled = false): MessageComponent[] {
        return [
            {
                type: MESSAGE_COMPONENT_TYPES.ACTION_ROW,
                components: [
                    {
                        type: MESSAGE_COMPONENT_TYPES.BUTTON,
                        custom_id: `rps_${id}_r`,
                        style: BUTTON_STYLES.PRIMARY,
                        emoji: { name: MiscUtils.getDefaultEmoji('ROCK'), id: null },
                        disabled,
                    },
                    {
                        type: MESSAGE_COMPONENT_TYPES.BUTTON,
                        custom_id: `rps_${id}_p`,
                        style: BUTTON_STYLES.PRIMARY,
                        emoji: { name: MiscUtils.getDefaultEmoji('PAPER'), id: null },
                        disabled,
                    },
                    {
                        type: MESSAGE_COMPONENT_TYPES.BUTTON,
                        custom_id: `rps_${id}_s`,
                        style: BUTTON_STYLES.PRIMARY,
                        emoji: { name: MiscUtils.getDefaultEmoji('SCISSORS'), id: null },
                        disabled,
                    },
                ],
            },
        ];
    }

    static getChoiceText(choice: RPSShow, locale?: Locale) {
        switch (choice) {
            case 'r':
                return `${MiscUtils.getDefaultEmoji('ROCK')} ${LangUtils.get('FUN_RPS_ROCK', locale)}`;
            case 'p':
                return `${MiscUtils.getDefaultEmoji('PAPER')} ${LangUtils.get('FUN_RPS_PAPER', locale)}`;
            case 's':
                return `${MiscUtils.getDefaultEmoji('SCISSORS')} ${LangUtils.get('FUN_RPS_SCISSORS', locale)}`;
        }
    }

    static getWinner(show1: RPSShow, show2: RPSShow) {
        if (show1 === show2) {
            return 0;
        } else if (
            (show1 === 'p' && show2 === 'r') ||
            (show1 === 's' && show2 === 'p') ||
            (show1 === 'r' && show2 === 's')
        ) {
            return 1;
        }
        return 2;
    }

    checkWinAndReply(interactionData: RockPaperScissorsInteraction, newInteraction: Interaction) {
        if (!interactionData.authorChoice || !interactionData.targetChoice) {
            return null;
        }
        const win = RPSUtils.getWinner(interactionData.authorChoice, interactionData.targetChoice);
        if (!win) {
            const tieText = LangUtils.getAndReplace(
                'FUN_RPS_TIE_USER',
                {
                    choice: RPSUtils.getChoiceText(interactionData.targetChoice),
                },
                newInteraction.locale
            );
            this.bot.interactionUtils.deleteItem(interactionData.interaction.id);
            return this.bot.api.interaction.editResponse(interactionData.interaction, {
                content: tieText,
                components: RPSUtils.getComponents(interactionData.interaction.id, true),
            });
        }
        let winner, wChoice, loser, lChoice;
        if (win === 2) {
            winner = TextUtils.mention.parseUser(interactionData.target);
            wChoice = RPSUtils.getChoiceText(interactionData.targetChoice);
            loser = TextUtils.mention.parseUser(interactionData.author);
            lChoice = RPSUtils.getChoiceText(interactionData.authorChoice);
        } else {
            winner = TextUtils.mention.parseUser(interactionData.author);
            wChoice = RPSUtils.getChoiceText(interactionData.authorChoice);
            loser = TextUtils.mention.parseUser(interactionData.target);
            lChoice = RPSUtils.getChoiceText(interactionData.targetChoice);
        }
        const winText = LangUtils.getAndReplace(
            'FUN_RPS_RESULT',
            { winner, wChoice, loser, lChoice },
            newInteraction.locale
        );
        this.bot.interactionUtils.deleteItem(interactionData.interaction.id);
        return this.bot.api.interaction.editResponse(interactionData.interaction, {
            content: winText,
            components: RPSUtils.getComponents(interactionData.interaction.id, true),
        });
    }

    async processPlayerChoice(interactionData: RockPaperScissorsInteraction, newInteraction: Interaction) {
        const authorID = 'member' in newInteraction ? newInteraction.member.user.id : newInteraction.user.id;
        if (!authorID) {
            this.bot.logger.debug(
                'PENDING INTERACTIONS',
                'Rock-paper-scissors interaction has no author:',
                newInteraction
            );
            return;
        }
        if (authorID !== interactionData.author && authorID !== interactionData.target) {
            let failResponse = LangUtils.get('FUN_RPS_INTERACTION_UNINVITED', newInteraction.locale);
            failResponse = `${this.bot.utils.getEmoji('BLOCKED', newInteraction)} ${failResponse}`;
            return this.bot.api.interaction.sendResponse(newInteraction, {
                type: INTERACTION_CALLBACK_TYPES.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: failResponse,
                    flags: INTERACTION_CALLBACK_FLAGS.EPHEMERAL,
                },
            });
        }
        if (
            (interactionData.targetChoice && authorID === interactionData.target) ||
            (interactionData.authorChoice && authorID === interactionData.author)
        ) {
            let failResponse = LangUtils.get('FUN_RPS_ALREADY_CHOSE', newInteraction.locale);
            failResponse = `${this.bot.utils.getEmoji('BLOCKED', newInteraction)} ${failResponse}`;
            return this.bot.api.interaction.sendResponse(newInteraction, {
                type: INTERACTION_CALLBACK_TYPES.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: failResponse,
                    flags: INTERACTION_CALLBACK_FLAGS.EPHEMERAL,
                },
            });
        }
        if (!newInteraction.data?.custom_id) {
            this.bot.logger.debug(
                'PENDING INTERACTIONS',
                'Rock-paper-scissors interaction is missing custom ID:',
                newInteraction
            );
            return;
        }
        const choice = newInteraction.data.custom_id.split('_')[2];
        if (!['r', 'p', 's'].includes(choice)) {
            this.bot.logger.debug(
                'PENDING INTERACTIONS',
                'Rock-paper-scissors interaction has an invalid custom ID:',
                newInteraction
            );
            return;
        }
        if (authorID === interactionData.author) {
            interactionData.authorChoice = choice as RPSShow;
        } else {
            interactionData.targetChoice = choice as RPSShow;
        }

        // ACK the current interaction
        await this.bot.api.interaction
            .sendResponse(newInteraction, { type: INTERACTION_CALLBACK_TYPES.DEFERRED_UPDATE_MESSAGE })
            .catch((err) => {
                this.bot.logger.handleError('PENDING INTERACTIONS', err, 'Failed to ack interaction');
            });

        const id = interactionData.interaction.id;

        const winResult = this.checkWinAndReply(interactionData, newInteraction);
        if (winResult) {
            this.bot.interactionUtils.deleteItem(id);
            return winResult;
        }

        let waitText = LangUtils.getAndReplace(
            'FUN_RPS_TURN',
            {
                user: TextUtils.mention.parseUser(
                    interactionData.authorChoice ? interactionData.target : interactionData.author
                ),
            },
            newInteraction.locale
        );
        waitText = `${this.bot.utils.getEmoji('WAITING', newInteraction)} ${waitText}`;

        return this.bot.api.interaction.editResponse(interactionData.interaction, {
            content: waitText,
            components: RPSUtils.getComponents(interactionData.interaction.id),
        });
    }
}
