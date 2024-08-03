import type { PokerInteraction } from '../../interactionUtils/poker.js';
import PokerUtils from '../../interactionUtils/poker.js';
import type { Interaction } from '../../types/types.js';
import CardUtils from '../../utils/card.js';
import type FunCommand from '../fun.js';

export default async function (this: FunCommand, interaction: Interaction) {
    const author = 'member' in interaction ? interaction.member.user : interaction.user;
    if (!author) {
        return this.handleUnexpectedError(interaction, 'AUTHOR_UNKNOWN');
    }

    const initialCards = CardUtils.drawCards(5) as PokerInteraction['current'];
    const initialResult = PokerUtils.getResult(initialCards);

    const gameData: PokerInteraction = {
        author: author.id,
        current: initialCards,
        held: [false, false, false, false, false],
        autohold: initialResult.autohold,
        preWin: initialResult.result !== 'NO_WIN',
        interaction,
    };

    const msgData = this.bot.interactionUtils.pokerUtils.getMessageData(gameData, false, interaction.locale);

    return this.respond(interaction, msgData).then((msg) => {
        this.bot.interactionUtils.addItem(gameData);
        return msg;
    });
}
