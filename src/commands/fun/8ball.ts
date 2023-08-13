import type { Interaction } from '../../types/types.js';
import LangUtils from '../../utils/language.js';
import type FunCommand from '../fun.js';

export default async function (this: FunCommand, interaction: Interaction) {
    return this.respond(interaction, LangUtils.getRandom('FUN_8BALL_OUTCOMES', interaction.locale), '8BALL')
        .catch(this.handleAPIError.bind(this));
}