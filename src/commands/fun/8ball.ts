import { Interaction } from '../../types/types';
import LangUtils from '../../utils/language';
import FunCommand from '../fun';

export default async function (this: FunCommand, interaction: Interaction) {
    return this.respond(interaction, LangUtils.getRandom('FUN_8BALL_OUTCOMES', interaction.locale), '8BALL')
        .catch(this.handleAPIError.bind(this));
}