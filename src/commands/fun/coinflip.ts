import { LangKey } from '../../text/languageList.js';
import { CommandOptionValue, Interaction } from '../../types/types.js';
import LangUtils from '../../utils/language.js';
import MiscUtils from '../../utils/misc.js';
import FunCommand from '../fun.js';

export default async function (this: FunCommand, interaction: Interaction, count?: CommandOptionValue) {
    if (!count || typeof count !== 'number') {
        count = 1;
    }
    if (count === 1) {
        const heads = MiscUtils.randomInt(1);
        const outcomeText = LangUtils.get(`FUN_COIN_${heads ? 'HEADS' : 'TAILS'}`, interaction.locale);
        return this.respond(interaction, outcomeText, heads ? 'HEADS' : 'TAILS')
            .catch(this.handleAPIError.bind(this));
    }
    let heads = 0, tails = 0;
    for (let i = 0; i < count; i++) {
        if (MiscUtils.randomInt(1)) {
            heads++;
        } else {
            tails++;
        }
    }
    const header = LangUtils.getAndReplace('FUN_COIN_COUNT', { count }, interaction.locale);
    const headsEmoji = this.getEmoji('HEADS', interaction);
    const headsText = LangUtils.getAndReplace(`FUN_COIN_NUM_HEADS${heads === 1 ? '_SINGLE' : ''}`, { count: heads }, interaction.locale);
    const tailsEmoji = this.getEmoji('TAILS', interaction);
    const tailsText = LangUtils.getAndReplace(`FUN_COIN_NUM_TAILS${tails === 1 ? '_SINGLE' : ''}`, { count: tails }, interaction.locale);
    const resultKey: LangKey = `FUN_COIN_RESULT_${ heads === tails ? 'TIE' : heads > tails ? 'HEADS' : 'TAILS' }`;
    const footer = LangUtils.getAndReplace(resultKey, { count: tails }, interaction.locale);

    return this.respond(interaction, `${header}\n${headsEmoji} ${headsText}\n${tailsEmoji} ${tailsText}\n${footer}`)
        .catch(this.handleAPIError.bind(this));
}