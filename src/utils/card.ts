import type Bot from '../structures/bot.js';
import type { Interaction } from '../types/types.js';
import MiscUtils from './misc.js';

export const SUITS = ['HEARTS', 'SPADES', 'CLUBS', 'DIAMONDS'] as const;
export const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] as const;
export type Card = {
    suit: (typeof SUITS)[number];
    num: (typeof NUMBERS)[number];
};

export const VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
export type CardValue = (typeof VALUES)[number];

export default class CardUtils {
    bot: Bot;

    constructor(bot: Bot) {
        this.bot = bot;
    }

    getCardText(card: Card, interaction: Interaction) {
        return this.bot.utils.getEmoji(`${card.suit}_${card.num}`, interaction);
    }
    getLargeCards(cards: Card[], interaction: Interaction, extraspaces = false) {
        if (!cards.length) {
            return '';
        }
        const cardsText = cards.map((card) => this.getCardText(card, interaction));

        if (cardsText[0].startsWith('<:')) {
            // using "real" emojis
            return `# ${cardsText.join(extraspaces ? ' ' : '')}`;
        } else {
            // using fallback emojis; reduce size and add |
            return `## ${cardsText.join(' | ')}`;
        }
    }

    static drawCards(count: number, usedCards?: Card[]): Card[] {
        const drawnCards: Card[] = [];
        for (let i = 0; i < count; i++) {
            drawnCards.push(
                MiscUtils.randomItem(
                    this.getAvailableCards(usedCards ? [...usedCards, ...drawnCards] : drawnCards)
                )
            );
        }
        return drawnCards;
    }
    static getAvailableCards(usedCards: Card[]): Card[] {
        const cards: Card[] = [];
        for (const suit of SUITS) {
            for (const num of NUMBERS) {
                if (usedCards.find((card) => card.suit == suit && card.num === num)) {
                    continue;
                }
                cards.push({ suit, num });
            }
        }
        return cards;
    }

    static getValue(card: Card): CardValue {
        if (card.num === 1) {
            // an ace can be treated as a 1 or 11; treat it as 11 for now
            return 11;
        }
        if (card.num === 11 || card.num === 12 || card.num === 13) {
            // jack, queen, king all treated as 10
            return 10;
        }
        return card.num;
    }
}
