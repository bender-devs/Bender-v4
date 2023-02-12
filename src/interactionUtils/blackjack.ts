import Bot from '../structures/bot';
import { BUTTON_STYLES, INTERACTION_CALLBACK_TYPES, MESSAGE_COMPONENT_TYPES } from '../types/numberTypes';
import { EmbedField, Interaction, Locale, MessageComponent, MessageData, User } from '../types/types';
import CDNUtils from '../utils/cdn';
import LangUtils from '../utils/language';
import MiscUtils from '../utils/misc';
import { BlackjackInteraction } from './pending';

const SUITS = ['HEARTS', 'SPADES', 'CLUBS', 'DIAMONDS'] as const;
const VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] as const;
export type Card = {
    suit: typeof SUITS[number],
    num: typeof VALUES[number]
}

const CARD_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
type CardValue = typeof CARD_VALUES[number];

const BJ_ACTIONS = ['hit', 'stand', 'double', 'split', 'hitRight', 'standRight'] as const;
type BlackjackAction = typeof BJ_ACTIONS[number];

const enum RESULTS {
    PUSH = 0,
    BOT,
    USER,
    SPLIT,
    SPLIT_PUSH
}

type WinData = {
    overall: RESULTS
    userMain: boolean,
    userMainBj: boolean,
    userRight?: boolean,
    userRightBj?: boolean,
    botBj: boolean,
}

export default class BlackjackUtils {
    bot: Bot;

    constructor(bot: Bot) {
        this.bot = bot;
    }

    static getValue(card: Card): CardValue {
        if (card.num === 1) { // an ace can be treated as a 1 or 11; treat it as 11 for now
            return 11;
        }
        if (card.num === 11 || card.num === 12 || card.num === 13) { // jack, queen, king all treated as 10
            return 10;
        }
        return card.num;
    }

    static getSum(hand: Card[]): number {
        const values = hand.map(card => BlackjackUtils.getValue(card));
        let sum = (values as number[]).reduce((prev, current) => prev + current);
        const aces = values.filter(val => val === 11).length;
        if (aces && sum > 21) {
            for (let i = 1; i <= aces; i++) {
                sum -= 10; // treat this ace as a 1 instead of an 11
                if (sum <= 21) {
                    break;
                }
            }
        }
        return sum;
    }

    static getComponents(interactionData: BlackjackInteraction, disable = false): MessageComponent[] {
        const hand = interactionData.authorHand;
        const rightHand = interactionData.authorRightHand;
        const locale = interactionData.interaction.locale;
        const id = interactionData.interaction.id;

        const canSplit = !rightHand && hand.length === 2 && hand[0].num === hand[1].num;
        const canHit = !interactionData.stand && this.getSum(hand) < 21;
        const canDouble = canHit && hand.length === 2;
        const perfect = this.getSum(hand) === 21;

        const buttonRows: MessageComponent[] = [{
            type: MESSAGE_COMPONENT_TYPES.ACTION_ROW,
            components: [{
                type: MESSAGE_COMPONENT_TYPES.BUTTON,
                custom_id: `bj_${id}_hit`,
                style: BUTTON_STYLES.DANGER,
                label: LangUtils.get('FUN_BJ_HIT', locale),
                disabled: !canHit || disable
            }, {
                type: MESSAGE_COMPONENT_TYPES.BUTTON,
                custom_id: `bj_${id}_stand`,
                style: BUTTON_STYLES.SUCCESS,
                label: LangUtils.get('FUN_BJ_STAND', locale),
                disabled: interactionData.stand || perfect || disable
            }, {
                type: MESSAGE_COMPONENT_TYPES.BUTTON,
                custom_id: `bj_${id}_double`,
                style: BUTTON_STYLES.SECONDARY,
                label: LangUtils.get('FUN_BJ_DOUBLE', locale),
                disabled: !!rightHand || !canDouble || disable
            }, {
                type: MESSAGE_COMPONENT_TYPES.BUTTON,
                custom_id: `bj_${id}_split`,
                style: BUTTON_STYLES.PRIMARY,
                label: LangUtils.get('FUN_BJ_SPLIT', locale),
                disabled: !!rightHand || !canSplit || disable
            }]
        }];

        if (rightHand) {
            const canHitRight = !interactionData.standRight && this.getSum(rightHand) < 21;
            const perfectRight = this.getSum(rightHand) === 21;

            buttonRows.push({
                type: MESSAGE_COMPONENT_TYPES.ACTION_ROW,
                components: [{
                    type: MESSAGE_COMPONENT_TYPES.BUTTON,
                    custom_id: `bj_${id}_hitRight`,
                    style: BUTTON_STYLES.DANGER,
                    label: LangUtils.get('FUN_BJ_HIT_RIGHT', locale),
                    disabled: !canHitRight || disable
                }, {
                    type: MESSAGE_COMPONENT_TYPES.BUTTON,
                    custom_id: `bj_${id}_standRight`,
                    style: BUTTON_STYLES.SUCCESS,
                    label: LangUtils.get('FUN_BJ_STAND_RIGHT', locale),
                    disabled: interactionData.standRight || perfectRight || disable
                }]
            })
        }

        return buttonRows;
    }

    static _getAvailableCards(usedCards: Card[]): Card[] {
        const cards: Card[] = [];
        for (const suit of SUITS) {
            for (const num of VALUES) {
                if (usedCards.find(card => card.suit == suit && card.num === num)) {
                    continue;
                }
                cards.push({ suit, num });
            }
        }
        return cards;
    }
    static getAvailableCards(interactionData: BlackjackInteraction): Card[] {
        const cards: Card[] = [];
        for (const suit of SUITS) {
            for (const num of VALUES) {
                if (interactionData.authorHand.find(card => card.suit == suit && card.num === num)) {
                    continue;
                }
                if (interactionData.botHand.find(card => card.suit == suit && card.num === num)) {
                    continue;
                }
                if (interactionData.authorRightHand?.find(card => card.suit == suit && card.num === num)) {
                    continue;
                }
                cards.push({ suit, num });
            }
        }
        return cards;
    }

    static hasBlackjack(hand: Card[]): boolean {
        return hand.length === 2 && this.getSum(hand) === 21;
    }

    static getWinner(interactionData: BlackjackInteraction): WinData | null {
        const botSum = this.getSum(interactionData.botHand);
        const botBj = BlackjackUtils.hasBlackjack(interactionData.botHand);
        const userSum = this.getSum(interactionData.authorHand);
        const userBj = BlackjackUtils.hasBlackjack(interactionData.authorHand);

        const data: WinData = {
            overall: RESULTS.PUSH,
            userMain: userSum <= 21 && !botBj && userSum > botSum,
            userMainBj: userBj,
            botBj
        }

        if (interactionData.authorRightHand) {
            const userSumRight = this.getSum(interactionData.authorRightHand);
            const userBjRight = BlackjackUtils.hasBlackjack(interactionData.authorRightHand);

            if (userSum > 21 && userSumRight > 21) { // double bust ( ͡° ͜ʖ ͡°)
                data.overall = RESULTS.BOT;
                return data;
            }
            if (botSum > 21) { // bot went bust
                if (userSum > 21 || userSumRight > 21) { // one of user's hands went bust
                    data.overall = RESULTS.SPLIT;
                    return data;
                }
                data.overall = RESULTS.USER;
                return data;
            }

            if (!interactionData.standRight && userSumRight < 21) { // player can still hit on the right hand
                return null;
            }
            if (!interactionData.stand && userSum < 21) { // player can still hit on the left hand
                return null;
            }
            if (botSum < 17) { // bot can still hit; dealer stands on 17
                return null;
            }

            data.userRight = userSumRight <= 21 && !botBj && userSumRight > botSum
            data.userRightBj = userBjRight;

            if ((userBj || data.userMain) && (userBjRight || data.userRight)) {
                data.overall = RESULTS.USER;
                return data;
            }
            if ((data.userMain && !data.userRight) || (!data.userMain && data.userRight)) {
                data.overall = RESULTS.SPLIT;
                return data;
            }
            if ((userSum === botSum && !data.userRight) || (!data.userMain && userSumRight === botSum)) {
                data.overall = RESULTS.SPLIT_PUSH;
                return data;
            }
            if (!data.userMain && !data.userRight) {
                data.overall = RESULTS.BOT;
                return data;
            }

            data.overall = RESULTS.PUSH;
            return data;
        }

        if (userBj && botBj) {
            data.overall = RESULTS.PUSH;
            return data;
        }
        if (userBj && !botBj) {
            data.overall = RESULTS.USER;
            return data;
        }
        if (!userBj && botBj) {
            data.overall = RESULTS.BOT;
            return data;
        }

        if (userSum > 21) {
            data.overall = RESULTS.BOT;
            return data;
        }
        if (botSum > 21) {
            data.overall = RESULTS.USER;
            return data;
        }
        if (!interactionData.stand && userSum < 21) { // player can still hit
            return null;
        }
        if (botSum < 17) { // bot can still hit; dealer stands on 17
            return null;
        }

        if (userSum > botSum) {
            data.overall = RESULTS.USER;
            return data;
        }
        if (botSum > userSum) {
            data.overall = RESULTS.BOT;
            return data;
        }
        data.overall = RESULTS.PUSH;
        return data;
    }

    getCardText(card: Card, interaction: Interaction) {
        return this.bot.utils.getEmoji(`${card.suit}_${card.num}`, interaction);
    }

    getMessageData(interactionData: BlackjackInteraction, author: User, locale?: Locale): MessageData {
        const userBj = BlackjackUtils.hasBlackjack(interactionData.authorHand);
        const botBj = BlackjackUtils.hasBlackjack(interactionData.botHand);
        const userBjRight = interactionData.authorRightHand && BlackjackUtils.hasBlackjack(interactionData.authorRightHand);

        let result = BlackjackUtils.getWinner(interactionData);

        let content = LangUtils.get('FUN_BJ_TITLE_START', locale);
        let userStatus = '', userStatusRight = '', botStatus = '';

        if (userBj && userBjRight && botBj) {
            userStatusRight = LangUtils.get('FUN_BJ_USER_BJ_RIGHT', locale);
            userStatus = LangUtils.get('FUN_BJ_USER_BJ', locale);
        } else if (userBj && botBj) {
            content = LangUtils.get('FUN_BJ_TITLE_PUSH', locale);
            userStatus = LangUtils.get('FUN_BJ_USER_BJ', locale);
            botStatus = LangUtils.get('FUN_BJ_BOT_BJ', locale);
        } else if (botBj) {
            content = LangUtils.get('FUN_BJ_TITLE_LOSS', locale);
            botStatus = LangUtils.get('FUN_BJ_BOT_BJ', locale);
            const userSum = BlackjackUtils.getSum(interactionData.authorHand);
            userStatus = LangUtils.getAndReplace('FUN_BJ_USER_HAS', { value: userSum }, locale);
        } else if (userBj) {
            content = LangUtils.get('FUN_BJ_TITLE_WIN', locale);
            userStatus = LangUtils.get('FUN_BJ_USER_BJ', locale);
            const botSum = BlackjackUtils.getSum(interactionData.botHand);
            botStatus = LangUtils.getAndReplace('FUN_BJ_BOT_HAS', { value: botSum }, locale);
        } else {
            const botSum = BlackjackUtils.getSum(interactionData.botHand);
            if (botSum > 21) {
                botStatus = LangUtils.getAndReplace('FUN_BJ_BOT_BUST', { value: botSum }, locale);
            } else if (result) {
                botStatus = LangUtils.getAndReplace('FUN_BJ_BOT_HAS', { value: botSum }, locale);
            } else {
                botStatus = LangUtils.get('FUN_BJ_BOT_FIRST', locale);
            }
            
            const sum = BlackjackUtils.getSum(interactionData.authorHand);
            if (interactionData.authorRightHand) {
                if (sum > 21) {
                    userStatus = LangUtils.getAndReplace('FUN_BJ_USER_BUST_LEFT', { value: sum }, locale);
                } else {
                    userStatus = LangUtils.getAndReplace('FUN_BJ_USER_HAS_LEFT', { value: sum }, locale);
                }

                const sumRight = BlackjackUtils.getSum(interactionData.authorRightHand);
                if (sumRight > 21) {
                    userStatusRight = LangUtils.getAndReplace('FUN_BJ_USER_BUST_RIGHT', { value: sumRight }, locale);
                } else {
                    userStatusRight = LangUtils.getAndReplace('FUN_BJ_USER_HAS_RIGHT', { value: sumRight }, locale);
                }
                if (sum === 21) {
                    interactionData.stand = true;
                }
                if (sumRight === 21) {
                    interactionData.standRight = true;
                }
                if (sum === 21 && sumRight === 21) { // automatically stand in both hands
                    this.processBotHit(interactionData);
                    result = BlackjackUtils.getWinner(interactionData);
                }
            } else {
                if (sum === 21) { // automatically stand
                    this.processBotHit(interactionData);
                    result = BlackjackUtils.getWinner(interactionData);
                    userStatus = LangUtils.getAndReplace('FUN_BJ_USER_HAS', { value: sum }, locale);
                } else if (sum > 21) {
                    userStatus = LangUtils.getAndReplace('FUN_BJ_USER_BUST', { value: sum }, locale);
                } else {
                    userStatus = LangUtils.getAndReplace('FUN_BJ_USER_HAS', { value: sum }, locale);
                }
            }
            if (result) {
                if (result.overall === RESULTS.BOT) {
                    if (interactionData.double) {
                        content = LangUtils.get('FUN_BJ_TITLE_LOSS_DOUBLE', locale);
                    } else {
                        content = LangUtils.get('FUN_BJ_TITLE_LOSS', locale);
                    }
                } else if (result.overall === RESULTS.PUSH) {
                    content = LangUtils.get('FUN_BJ_TITLE_PUSH', locale);
                } else if (result.overall === RESULTS.SPLIT) {
                    content = LangUtils.get('FUN_BJ_TITLE_SPLIT', locale);
                } else if (result.overall === RESULTS.SPLIT_PUSH) {
                    content = LangUtils.get('FUN_BJ_TITLE_SPLIT_PUSH', locale);
                } else if (interactionData.double) {
                    content = LangUtils.get('FUN_BJ_TITLE_WIN_DOUBLE', locale);
                } else {
                    content = LangUtils.get('FUN_BJ_TITLE_WIN', locale);
                }
            }
        }

        const inter = interactionData.interaction;
        const components = BlackjackUtils.getComponents(interactionData, !!result);
        const authorFields: EmbedField[] = [{
            name: userStatus,
            value: interactionData.authorHand.map(card => this.getCardText(card, inter)).join(' | ')
        }];
        if (interactionData.authorRightHand) {
            authorFields.push({
                name: userStatusRight,
                value: interactionData.authorRightHand.map(card => this.getCardText(card, inter)).join(' | ')
            })
        }

        return {
            content,
            embeds: [{
                author: {
                    name: author.username,
                    icon_url: author.avatar ? CDNUtils.userAvatar(author.id, author.avatar) : undefined
                },
                fields: authorFields
            }, {
                author: {
                    name: this.bot.user.username,
                    icon_url: this.bot.user.avatar ? CDNUtils.userAvatar(this.bot.user.id, this.bot.user.avatar) : undefined
                },
                fields: [{
                    name: botStatus,
                    value: result ? interactionData.botHand.map(card => this.getCardText(card, inter)).join(' | ') : this.getCardText(interactionData.botHand[0], inter)
                }]
            }],
            components
        }
    }

    processBotHit(interactionData: BlackjackInteraction, newCard?: Card) {
        let botSum = BlackjackUtils.getSum(interactionData.botHand);
        let newBotCard = newCard || MiscUtils.randomItem(BlackjackUtils.getAvailableCards(interactionData));
        while (botSum < 17) {
            interactionData.botHand.push(newBotCard);
            botSum = BlackjackUtils.getSum(interactionData.botHand);
            newBotCard = MiscUtils.randomItem(BlackjackUtils.getAvailableCards(interactionData));
        }
    }

    async processPlayerAction(interactionData: BlackjackInteraction, newInteraction: Interaction) {
        const author = newInteraction.member?.user || newInteraction.user;
        if (!author) {
            this.bot.logger.debug('BLACKJACK', 'Interaction has no author:', newInteraction);
            return;
        }
        if (!newInteraction.data?.custom_id) {
            this.bot.logger.debug('BLACKJACK', 'Interaction is missing custom ID:', newInteraction);
            return;
        }
        const action = newInteraction.data.custom_id.split('_')[2] as BlackjackAction;
        if (!action || !BJ_ACTIONS.includes(action)) {
            this.bot.logger.debug('BLACKJACK', 'Interaction has an invalid custom ID:', newInteraction);
            return;
        }

        // ACK the current interaction
        await this.bot.api.interaction.sendResponse(newInteraction, { type: INTERACTION_CALLBACK_TYPES.DEFERRED_UPDATE_MESSAGE }).catch(err => {
            this.bot.logger.handleError('BLACKJACK', err, 'Failed to ack interaction.');
        });

        let leftDone = interactionData.stand || BlackjackUtils.getSum(interactionData.authorHand) >= 21;
        let rightDone = !interactionData.authorRightHand || interactionData.standRight || BlackjackUtils.getSum(interactionData.authorRightHand) >= 21;

        const newCard = MiscUtils.randomItem(BlackjackUtils.getAvailableCards(interactionData));
        if (action === 'hit') {
            interactionData.authorHand.push(newCard);
            leftDone = BlackjackUtils.getSum(interactionData.authorHand) >= 21;
        } else if (action === 'hitRight') {
            if (interactionData.authorRightHand) {
                interactionData.authorRightHand.push(newCard);
                rightDone = BlackjackUtils.getSum(interactionData.authorRightHand) >= 21;
            } else {
                this.bot.logger.debug('BLACKJACK', 'Invalid operation: hitRight without authorRightHand', interactionData);
            }
        } else if (action === 'double') {
            interactionData.authorHand.push(newCard);
            interactionData.stand = true;
            leftDone = true;
            interactionData.double = true;
        } else if (action === 'split') {
            const newCard2 = MiscUtils.randomItem(BlackjackUtils.getAvailableCards(interactionData));
            interactionData.authorRightHand = [interactionData.authorHand[1], newCard2];
            interactionData.authorHand = [interactionData.authorHand[0], newCard];
        } else if (action === 'stand') {
            interactionData.stand = true;
            leftDone = true;
        } else if (action === 'standRight') {
            interactionData.standRight = true;
            rightDone = true;
        }

        const leftBust = BlackjackUtils.getSum(interactionData.authorHand) > 21;
        if (interactionData.authorRightHand) {
            const rightBust = BlackjackUtils.getSum(interactionData.authorRightHand) > 21;
            if (leftDone && rightDone && !(leftBust && rightBust)) {
                this.processBotHit(interactionData);
            }
        } else if (leftDone && !leftBust) {
            this.processBotHit(interactionData);
        }

        const msgData = this.getMessageData(interactionData, author, interactionData.interaction.locale);

        return this.bot.api.interaction.editResponse(interactionData.interaction, msgData);
    }
}