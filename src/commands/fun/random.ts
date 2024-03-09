import type { CommandOptionValue, Interaction } from '../../types/types.js';
import LangUtils from '../../utils/language.js';
import MiscUtils from '../../utils/misc.js';
import type FunCommand from '../fun.js';

export default async function (
    this: FunCommand,
    interaction: Interaction,
    min?: CommandOptionValue,
    max?: CommandOptionValue,
    dec?: CommandOptionValue
) {
    if (typeof min !== 'number') {
        min = 0;
    }
    if (typeof max !== 'number') {
        max = 1000;
    }
    if (dec !== true) {
        dec = false;
    }
    const num = dec ? MiscUtils.randomNumber(max, min) : MiscUtils.randomInt(max, min);
    const choiceText = LangUtils.getAndReplace('FUN_RANDOM_RESULT', { num, max, min }, interaction.locale);

    return this.respond(interaction, choiceText, 'NUMBERS').catch(this.handleAPIError.bind(this));
}
