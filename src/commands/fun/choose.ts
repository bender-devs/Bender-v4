import { CommandOptionValue, Interaction } from '../../types/types.js';
import LangUtils from '../../utils/language.js';
import MiscUtils from '../../utils/misc.js';
import FunCommand from '../fun.js';

export default async function (this: FunCommand, interaction: Interaction, choices?: CommandOptionValue) {
    if (!choices || typeof choices !== 'string') {
        return this.handleUnexpectedError(interaction, 'ARGS_INVALID_TYPE');
    }
    const oneChoice = LangUtils.get('FUN_CHOOSE_ONE_CHOICE', interaction.locale);
    let choicesArr = choices.split('|').map(item => item.trim()).filter(item => !!item);
    if (choicesArr.length < 2) {
        const hint = LangUtils.get('FUN_CHOOSE_ONE_CHOICE_HINT', interaction.locale);
        return this.respond(interaction, `${oneChoice} (${hint})`, 'THINK')
            .catch(this.handleAPIError.bind(this));
    }
    choicesArr = choicesArr.filter((item, index) => choicesArr.indexOf(item) === index); // remove duplicates
    if (choicesArr.length < 2) {
        return this.respond(interaction, oneChoice, 'THINK')
            .catch(this.handleAPIError.bind(this));
    }

    const choice = `${MiscUtils.randomItem(choicesArr)}`;
    const choiceText = LangUtils.getAndReplace('FUN_CHOOSE_RESULT', { choice }, interaction.locale);

    return this.respond(interaction, choiceText, 'THINK')
        .catch(this.handleAPIError.bind(this));
}