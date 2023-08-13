import type { CommandOptionValue, Interaction } from '../../types/types.js';
import LangUtils from '../../utils/language.js';
import type { EmojiKey } from '../../utils/misc.js';
import MiscUtils from '../../utils/misc.js';
import type FunCommand from '../fun.js';

export default async function (this: FunCommand, interaction: Interaction, count?: CommandOptionValue, sides?: CommandOptionValue) {
    if (!count || typeof count !== 'number') {
        count = 1;
    }
    if (typeof sides !== 'number' || sides < 3) {
        sides = 6;
    }
    if (count === 1) {
        const num = MiscUtils.randomInt(sides, 1);

        if (sides === 6) {
            const outcomePrepend = LangUtils.get('FUN_DICE_NORMAL_SINGLE', interaction.locale);
            const emoji = `DIE_${num}` as EmojiKey;
            const emojiText = this.getEmoji(emoji, interaction);
            return this.respond(interaction, `${outcomePrepend} ${emojiText} **${num}**`, 'DIE')
                .catch(this.handleAPIError.bind(this));
        }

        const outcomeText = LangUtils.getAndReplace('FUN_DICE_SIDES_SINGLE', { num, sides }, interaction.locale);
        return this.respond(interaction, outcomeText, 'DIE')
            .catch(this.handleAPIError.bind(this));
    }
    const results = new Array<number>(sides).fill(0);
    for (let i = 0; i < count; i++) {
        results[MiscUtils.randomInt(sides - 1)]++;
    }
    let sum = 0;
    let reply = LangUtils.getAndReplace(`FUN_DICE_${sides === 6 ? 'NORMAL' : 'SIDES'}`, { count, sides }, interaction.locale);

    for (let i = 0; i < results.length; i++) {
        sum += (i + 1) * results[i];
        if (results[i] > 0) {
            reply += '\n';
            if (sides === 6) {
                const emoji = `DIE_${i + 1}` as EmojiKey;
                reply += `${this.getEmoji(emoji, interaction)} `;
            }
            reply += LangUtils.getAndReplace(`FUN_DICE_DETAIL${results[i] === 1 ? '_SINGLE' : ''}`, { num: i + 1, count: results[i] }, interaction.locale);
        }
    }

    reply += `\n${LangUtils.getAndReplace('FUN_DICE_TOTAL', { sum }, interaction.locale)}`;
    
    return this.respond(interaction, reply, 'DIE')
        .catch(this.handleAPIError.bind(this));
}