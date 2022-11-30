import { CommandOptionValue, Interaction } from '../../types/types';
import LangUtils from '../../utils/language';
import MiscUtils from '../../utils/misc';
import FunCommand from '../fun';

export default async function (this: FunCommand, interaction: Interaction, show?: CommandOptionValue) {
    if (!show || typeof show !== 'string' || !['r', 'p', 's'].includes(show)) {
        return this.handleUnexpectedError(interaction, 'ARGS_INVALID_TYPE');
    }

    const botShow = MiscUtils.randomItem(['r', 'p', 's']);
    const choiceKey = botShow === 'r' ? 'ROCK' : botShow === 'p' ? 'PAPER' : 'SCISSORS';
    const choice = LangUtils.get(`FUN_RPS_${choiceKey}`, interaction.locale);
    let replyString = `${LangUtils.getAndReplace('FUN_RPS_CHOICE', { choice }, interaction.locale)} `;

    if (show === botShow) {
        replyString += LangUtils.get('FUN_RPS_TIE', interaction.locale);
    } else if (
        (botShow === 'p' && show === 'r') ||
        (botShow === 's' && show === 'p') ||
        (botShow === 'r' && show === 's')
    ) {
        replyString += LangUtils.get('FUN_RPS_WIN', interaction.locale);
    } else {
        replyString += LangUtils.get('FUN_RPS_LOSS', interaction.locale);
    }

    return this.respond(interaction, replyString, choiceKey)
        .catch(this.handleAPIError.bind(this));
}