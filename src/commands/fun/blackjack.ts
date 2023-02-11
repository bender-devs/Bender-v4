import BlackjackUtils from '../../interactionUtils/blackjack';
import { BlackjackInteraction } from '../../interactionUtils/pending';
import { Interaction } from '../../types/types';
import MiscUtils from '../../utils/misc';
import FunCommand from '../fun';

export default async function (this: FunCommand, interaction: Interaction) {
    const author = interaction.member?.user || interaction.user;
    if (!author) {
        return this.handleUnexpectedError(interaction, 'AUTHOR_UNKNOWN');
    }

    const userCard1 = MiscUtils.randomItem(BlackjackUtils._getAvailableCards([]));
    const userCard2 = MiscUtils.randomItem(BlackjackUtils._getAvailableCards([userCard1]));
    const botCard1 = MiscUtils.randomItem(BlackjackUtils._getAvailableCards([userCard1, userCard2]));
    const botCard2 = MiscUtils.randomItem(BlackjackUtils._getAvailableCards([userCard1, userCard2, botCard1]));

    const gameData: BlackjackInteraction = {
        author: author.id,
        authorHand: [userCard1, userCard2],
        botHand: [botCard1, botCard2],
        interaction
    };

    const msgData = this.bot.interactionUtils.bjUtils.getMessageData(gameData, author, interaction.locale);

    return this.respond(interaction, msgData).then(msg => {
        this.bot.interactionUtils.addItem(gameData);
        return msg;
    });
}