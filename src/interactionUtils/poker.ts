import type Bot from '../structures/bot.js';
import {
    BUTTON_STYLES_GENERIC,
    INTERACTION_CALLBACK_FLAGS,
    INTERACTION_CALLBACK_TYPES,
    MESSAGE_COMPONENT_TYPES,
} from '../types/numberTypes.js';
import type { Interaction, Locale, MessageComponent, MessageData } from '../types/types.js';
import type { Card } from '../utils/card.js';
import CardUtils from '../utils/card.js';
import LangUtils from '../utils/language.js';
import type { PendingInteractionBase } from './pending.js';

type ArrayFive<T> = [T, T, T, T, T];

export interface PokerInteraction extends PendingInteractionBase {
    current: ArrayFive<Card>;
    held: ArrayFive<boolean>;
    autohold: ArrayFive<boolean>;
    preWin: boolean;
}

const POKER_RESULT = [
    'NO_WIN',
    'JACKS_OR_BETTER',
    'TWO_PAIR',
    'THREE_OF_A_KIND',
    'STRAIGHT',
    'FLUSH',
    'FULL_HOUSE',
    'FOUR_OF_A_KIND',
    'STRAIGHT_FLUSH',
    'ROYAL_FLUSH',
] as const;
type PokerResultName = (typeof POKER_RESULT)[number];

export type PokerResult = {
    result: PokerResultName;
    autohold: PokerInteraction['autohold'];
};

const POKER_ACTIONS = ['hold1', 'hold2', 'hold3', 'hold4', 'hold5', 'deal', 'autohold'];
type PokerAction = (typeof POKER_ACTIONS)[number];

const POKER_MULTIPLIERS: Record<PokerResultName, number> = {
    NO_WIN: 0,
    JACKS_OR_BETTER: 1,
    TWO_PAIR: 2,
    THREE_OF_A_KIND: 3,
    STRAIGHT: 4,
    FLUSH: 6,
    FULL_HOUSE: 9,
    FOUR_OF_A_KIND: 25,
    STRAIGHT_FLUSH: 50,
    ROYAL_FLUSH: 250,
} as const;

export default class PokerUtils {
    bot: Bot;
    cardUtils: CardUtils;

    constructor(bot: Bot) {
        this.bot = bot;
        this.cardUtils = new CardUtils(bot);
    }

    async processPlayerAction(interactionData: PokerInteraction, newInteraction: Interaction) {
        const author = 'member' in newInteraction ? newInteraction.member.user : newInteraction.user;
        if (!author) {
            this.bot.logger.debug('POKER', 'Interaction has no author:', newInteraction);
            return;
        }
        if (!newInteraction.data?.custom_id) {
            this.bot.logger.debug('POKER', 'Interaction is missing custom ID:', newInteraction);
            return;
        }
        const action = newInteraction.data.custom_id.split('_')[2] as PokerAction;
        if (!action || !POKER_ACTIONS.includes(action)) {
            this.bot.logger.debug('POKER', 'Interaction has an invalid custom ID:', newInteraction);
            return;
        }

        if (author.id !== interactionData.author) {
            const failResponseText = LangUtils.get('FUN_POKER_INTERACTION_UNINVITED', newInteraction.locale);
            const failResponseSubtext = `\n-# ${LangUtils.get(
                'FUN_POKER_INTERACTION_UNINVITED_SUBTEXT',
                newInteraction.locale
            )}`;
            const failResponse = `${this.bot.utils.getEmoji(
                'BLOCKED',
                newInteraction
            )} ${failResponseText}${failResponseSubtext}`;
            return this.bot.api.interaction.sendResponse(newInteraction, {
                type: INTERACTION_CALLBACK_TYPES.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: failResponse,
                    flags: INTERACTION_CALLBACK_FLAGS.EPHEMERAL,
                },
            });
        }

        // ACK the current interaction
        await this.bot.api.interaction
            .sendResponse(newInteraction, { type: INTERACTION_CALLBACK_TYPES.DEFERRED_UPDATE_MESSAGE })
            .catch((err) => {
                this.bot.logger.handleError('POKER', err, 'Failed to ack interaction.');
            });

        if (action.startsWith('hold')) {
            const index = parseInt(action[4]) - 1;
            interactionData.held[index] = !interactionData.held[index];
        }
        // fall through to update "hold" emojis

        if (action === 'autohold') {
            interactionData.held = interactionData.autohold;
        }
        // autohold is the same as deal after assigning "held"
        if (action === 'deal' || action === 'autohold') {
            const discarded: Card[] = [];
            for (let i = 0; i < 5; i++) {
                if (!interactionData.held[i]) {
                    const newCard = CardUtils.drawCards(1, [...interactionData.current, ...discarded]);
                    discarded.push(interactionData.current[i]);
                    interactionData.current[i] = newCard[0];
                }
            }
        }

        const msgData = this.getMessageData(
            interactionData,
            !action.startsWith('hold'),
            interactionData.interaction.locale
        );

        return this.bot.api.interaction.editResponse(interactionData.interaction, msgData);
    }

    static getComponents(interactionData: PokerInteraction, preWin = false, disable = false): MessageComponent[] {
        const locale = interactionData.interaction.locale;
        const id = interactionData.interaction.id;

        const holdButtons: MessageComponent[] = [];
        for (let i = 0; i < 5; i++) {
            holdButtons.push({
                type: MESSAGE_COMPONENT_TYPES.BUTTON,
                custom_id: `poker_${id}_hold${i + 1}`,
                style: BUTTON_STYLES_GENERIC.SECONDARY,
                label: LangUtils.get(`FUN_POKER_${interactionData.held[i] ? 'UN' : ''}HOLD`, locale),
                disabled: disable,
            });
        }

        const dealButtons: MessageComponent[] = [
            {
                type: MESSAGE_COMPONENT_TYPES.BUTTON,
                custom_id: `poker_${id}_deal`,
                style: BUTTON_STYLES_GENERIC.SUCCESS,
                label: LangUtils.get('FUN_POKER_DEAL', locale),
                disabled: disable,
            },
        ];
        if (preWin) {
            dealButtons.push({
                type: MESSAGE_COMPONENT_TYPES.BUTTON,
                custom_id: `poker_${id}_autohold`,
                style: BUTTON_STYLES_GENERIC.DANGER,
                label: LangUtils.get('FUN_POKER_AUTOHOLD', locale),
                disabled: disable,
            });
        }

        return [
            {
                type: MESSAGE_COMPONENT_TYPES.ACTION_ROW,
                components: holdButtons,
            },
            {
                type: MESSAGE_COMPONENT_TYPES.ACTION_ROW,
                components: dealButtons,
            },
        ];
    }

    getMessageData(interactionData: PokerInteraction, dealt = false, locale?: Locale): MessageData {
        const pokerEmoji = this.bot.utils.getEmoji('POKER', interactionData.interaction);
        let content = `## ${pokerEmoji} ${LangUtils.get('FUN_POKER_TITLE', locale)}`;

        content += `\n\n${this.cardUtils.getLargeCards(
            interactionData.current,
            interactionData.interaction,
            true
        )}`;
        const holdOn = this.bot.utils.getEmoji('HOLD_ON', interactionData.interaction);
        const holdOff = this.bot.utils.getEmoji('HOLD_OFF', interactionData.interaction);
        content += `\n# ${interactionData.held.map((hold) => (hold ? holdOn : holdOff)).join(' ')}`;

        if (dealt) {
            const result = PokerUtils.getResult(interactionData.current);
            this.bot.logger.debug('Poker result', result);
            const multiplier = LangUtils.formatNumber(POKER_MULTIPLIERS[result.result], locale);

            // omit royal flush since that's covered in preWin logic
            switch (result.result) {
                case 'STRAIGHT_FLUSH': {
                    content += `\n\n## ${LangUtils.get('FUN_POKER_RESULT_STRAIGHT_FLUSH', locale)}`;
                    break;
                }
                case 'FOUR_OF_A_KIND': {
                    content += `\n\n## ${LangUtils.get('FUN_POKER_RESULT_FOUR_OF_A_KIND', locale)}`;
                    break;
                }
                case 'STRAIGHT':
                case 'FLUSH':
                case 'FULL_HOUSE': {
                    content += `\n\n### ${LangUtils.getAndReplace(
                        'FUN_POKER_RESULT_BIG_WIN',
                        { hand: LangUtils.get(`FUN_POKER_HAND_${result.result}`, locale), multiplier },
                        locale
                    )}`;
                    break;
                }
                case 'THREE_OF_A_KIND':
                case 'TWO_PAIR':
                case 'JACKS_OR_BETTER': {
                    content += `\n\n### ${LangUtils.getAndReplace(
                        'FUN_POKER_RESULT_WIN',
                        { hand: LangUtils.get(`FUN_POKER_HAND_${result.result}`, locale), multiplier },
                        locale
                    )}`;
                    break;
                }
                default: {
                    content += `\n\n### ${LangUtils.get('FUN_POKER_RESULT_NO_WIN', locale)}`;
                    break;
                }
            }
        } else if (interactionData.preWin) {
            const result = PokerUtils.getResult(interactionData.current);
            this.bot.logger.debug('Poker result', result);
            if (result.result === 'NO_WIN') {
                content += `\n\n### ${LangUtils.get('FUN_POKER_RESULT_NO_WIN', locale)}`;
                return { content };
            }

            // best possible hand, end automatically
            if (result.result === 'ROYAL_FLUSH') {
                content += `\n\n# ${LangUtils.get('FUN_POKER_RESULT_ROYAL_FLUSH', locale)}`;
                return { content };
            }

            content += `\n\n### ${LangUtils.getAndReplace(
                'FUN_POKER_RESULT_PREWIN',
                { hand: LangUtils.get(`FUN_POKER_HAND_${result.result}`, locale) },
                locale
            )}`;

            if (interactionData.autohold.find((hold) => !hold)) {
                // at least one card is not "winning"
                content += `\n-# ${LangUtils.getAndReplace(
                    'FUN_POKER_RESULT_PREWIN_SUBTEXT',
                    { autohold: LangUtils.get('FUN_POKER_AUTOHOLD', locale) },
                    locale
                )}`;
            } else {
                // all cards are "winning"
                content += `\n-# ${LangUtils.getAndReplace(
                    'FUN_POKER_RESULT_PREWIN_5CARD_SUBTEXT',
                    { autohold: LangUtils.get('FUN_POKER_AUTOHOLD', locale) },
                    locale
                )}`;
            }
        }

        const components = PokerUtils.getComponents(interactionData, interactionData.preWin, dealt);

        return { content, components };
    }

    static getResult(hand: Card[]): PokerResult {
        const sortedHand = hand.slice().sort((a, b) => a.num - b.num);
        const flush = hand.every((card) => card.suit === hand[0].suit);
        if (flush) {
            // obviously the ace should be high (at the end), but it is represented as 1
            if (
                sortedHand[0].num === 1 &&
                sortedHand[1].num === 10 &&
                sortedHand[2].num === 11 &&
                sortedHand[3].num === 12 &&
                sortedHand[4].num === 13
            ) {
                return {
                    result: 'ROYAL_FLUSH',
                    autohold: [true, true, true, true, true],
                };
            }
        }
        const straight = this.isStraight(sortedHand);
        if (flush && straight) {
            return {
                result: 'STRAIGHT_FLUSH',
                autohold: [true, true, true, true, true],
            };
        }
        if (flush) {
            return {
                result: 'FLUSH',
                autohold: [true, true, true, true, true],
            };
        }
        if (straight) {
            return {
                result: 'STRAIGHT',
                autohold: [true, true, true, true, true],
            };
        }
        const mostOfAKind = this.mostOfAKind(sortedHand);
        const uniqueNums = new Set(hand.map((card) => card.num)).size;
        if (mostOfAKind === 4) {
            // first card in sorted hand is the "odd one out"
            const otherCardFirst = sortedHand[0].num !== sortedHand[1].num;
            const otherCard = otherCardFirst ? sortedHand[0] : sortedHand[1];
            const otherCardIndex = hand.findIndex((card) => card.num === otherCard.num);
            const autohold: PokerInteraction['autohold'] = [true, true, true, true, true];
            autohold[otherCardIndex] = false;

            return {
                result: 'FOUR_OF_A_KIND',
                autohold,
            };
        }
        if (mostOfAKind === 3) {
            if (uniqueNums === 2) {
                return {
                    result: 'FULL_HOUSE',
                    autohold: [true, true, true, true, true],
                };
            }
            const handNumbers = hand.map((card) => card.num);
            // the number which there are three of
            const number = handNumbers.find((num) => handNumbers.indexOf(num) !== handNumbers.lastIndexOf(num));
            // the indexes of the other two cards
            const otherCardIndexes: number[] = [];
            hand.forEach((card, index) => {
                if (card.num !== number) {
                    otherCardIndexes.push(index);
                }
            });

            const autohold: PokerInteraction['autohold'] = [true, true, true, true, true];
            // don't hold the other 2 cards
            for (const index of otherCardIndexes) {
                autohold[index] = false;
            }
            return {
                result: 'THREE_OF_A_KIND',
                autohold,
            };
        }
        if (mostOfAKind === 2 && uniqueNums === 3) {
            const handNumbers = hand.map((card) => card.num);
            const otherCardIndex = handNumbers.findIndex(
                (num) => handNumbers.indexOf(num) === handNumbers.lastIndexOf(num)
            );
            const autohold: PokerInteraction['autohold'] = [true, true, true, true, true];
            autohold[otherCardIndex] = false;
            return {
                result: 'TWO_PAIR',
                autohold,
            };
        }
        if (mostOfAKind === 2 && this.isJacksOrBetter(sortedHand)) {
            const handNumbers = hand.map((card) => card.num);
            // the number which there are two of
            const number = handNumbers.find((num) => handNumbers.indexOf(num) !== handNumbers.lastIndexOf(num));
            // the indexes of the pair of cards
            const cardIndexes: number[] = [];
            hand.forEach((card, index) => {
                if (card.num === number) {
                    cardIndexes.push(index);
                }
            });

            const autohold: PokerInteraction['autohold'] = [false, false, false, false, false];
            // don't hold the other 2 cards
            for (const index of cardIndexes) {
                autohold[index] = true;
            }
            return {
                result: 'JACKS_OR_BETTER',
                autohold,
            };
        }
        return {
            result: 'NO_WIN',
            autohold: [false, false, false, false, false],
        };
    }

    static isStraight(sortedHand: Card[]): boolean {
        for (let i = 0; i < 4; i++) {
            // checks for sequential numbers, including aces after kings
            if (
                sortedHand[i].num + 1 !== sortedHand[i + 1].num &&
                !(sortedHand[i].num === 13 && sortedHand[i + 1].num === 1)
            ) {
                return false;
            }
        }
        return true;
    }

    static mostOfAKind(sortedHand: Card[]): number {
        const sortedHandNums = sortedHand.map((card) => card.num);
        const uniqueNums = new Set(sortedHandNums).size;
        if (uniqueNums === 2) {
            // could be 4 of a kind or full house
            if (sortedHandNums[1] === sortedHandNums[2] && sortedHandNums[2] === sortedHandNums[3]) {
                // in a sorted list, the 3 middle elements being the same means 4 of a kind
                return 4;
            }
            return 3;
        } else if (uniqueNums === 3) {
            // could be two pair or three of a kind
            if (sortedHandNums[0] === sortedHandNums[1] && sortedHandNums[1] === sortedHandNums[2]) {
                // found three of a kind at the beginning of the list
                return 3;
            } else if (sortedHandNums[1] === sortedHandNums[2] && sortedHandNums[2] === sortedHandNums[3]) {
                // found three of a kind in the middle of the list
                return 3;
            } else if (sortedHandNums[2] === sortedHandNums[3] && sortedHandNums[3] === sortedHandNums[4]) {
                // found three of a kind at the end of the list
                return 3;
            }
            // must be two pair
            return 2;
        } else {
            // 4 unique = one pair, 5 unique = no win
            return 6 - uniqueNums;
        }
    }

    static isJacksOrBetter(sortedHand: Card[]): boolean {
        const sortedHandNums = sortedHand.map((card) => card.num);
        for (let i = 0; i < sortedHandNums.length - 1; i++) {
            if (sortedHandNums[i] === sortedHandNums[i + 1]) {
                // found a pair
                const pairNum = sortedHandNums[i];
                if (pairNum >= 11 || pairNum === 1) {
                    // jacks or better, including aces
                    return true;
                }
            }
        }
        return false;
    }
}
