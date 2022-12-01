import { CommandOptionValue, Interaction, Snowflake } from '../../types/types';
import LangUtils from '../../utils/language';
import MiscUtils, { EmojiKey } from '../../utils/misc';
import IMAGES from '../../data/images';
import FunCommand from '../fun';
import TextUtils from '../../utils/text';

const base64ModChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'.split('');

export default async function (this: FunCommand, interaction: Interaction, userString?: CommandOptionValue) {
    if (!userString || typeof userString !== 'string') {
        return this.handleUnexpectedError(interaction, 'ARGS_INVALID_TYPE');
    }
    const userID = userString as Snowflake;

    if (userID === this.bot.user.id) {
        const img = MiscUtils.randomItem(IMAGES.uwotm8);
        return this.respond(interaction, img)
            .catch(this.handleAPIError.bind(this));
    }

    const user = await this.bot.api.user.fetch(userID).catch(() => null);

    if (user?.bot) {
        const response = LangUtils.get('FUN_HACK_BOT', interaction.locale);
        return this.respond(interaction, response, 'ANGRY')
            .catch(this.handleAPIError.bind(this));
    }

    let progress = ''; // make animated bar
    for (let i = 1; i < 7; i++) {
        progress += this.getEmoji(`BAR_${i}` as EmojiKey, interaction);
    }

    const progressText = LangUtils.getAndReplace('FUN_HACK_PROGRESS', {
        user: TextUtils.mention.parseUser(userID),
        progress
    }, interaction.locale);
    await this.respond(interaction, progressText, 'HACK');

    const createdTimestamp = TextUtils.timestamp.fromSnowflake(userID)
    const value = Math.floor(createdTimestamp / 1000) - 1293840000; // timestamp in seconds minus token epoch

    const part1 = Buffer.from(userID).toString('base64'); // string to base64
    const part2 = Buffer.from([value>>24,value>>16,value>>8,value]).toString('base64').substring(0, 6); // number to base64
    let part3 = ''; // generate random base64-esque number
    for (let i = 0; i < 27; i++) {
        part3 += MiscUtils.randomItem(base64ModChars);
    }

    progress = ''; // make static bar
    for (const i of [1,2,2,2,2,3]) {
        progress += this.getEmoji(`BAR_${i}_FULL` as EmojiKey, interaction);
    }

    await new Promise(resolve => setTimeout(resolve, 3000));

    const completedText = LangUtils.getAndReplace('FUN_HACK_COMPLETE', {
        user: TextUtils.mention.parseUser(userID),
        progress,
        token: `${part1}.${part2}.${part3}`
    }, interaction.locale)
    return this.editResponse(interaction, completedText, 'HACK');
}