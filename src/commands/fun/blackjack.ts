import type { BlackjackInteraction } from '../../interactionUtils/blackjack.js';
import type { Interaction } from '../../types/types.js';
import CardUtils from '../../utils/card.js';
import type FunCommand from '../fun.js';

export default async function (this: FunCommand, interaction: Interaction) {
    const author = 'member' in interaction ? interaction.member.user : interaction.user;
    if (!author) {
        return this.handleUnexpectedError(interaction, 'AUTHOR_UNKNOWN');
    }

    const userCards = CardUtils.drawCards(2);
    const botCards = CardUtils.drawCards(2, userCards);

    const gameData: BlackjackInteraction = {
        author: author.id,
        authorHand: userCards,
        botHand: botCards,
        interaction,
    };

    const msgData = this.bot.interactionUtils.bjUtils.getMessageData(gameData, author, interaction.locale);

    return this.respond(interaction, msgData).then((msg) => {
        this.bot.interactionUtils.addItem(gameData);
        return msg;
    });
}
