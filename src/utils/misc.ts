import Bot from '../structures/bot';
import * as EMOTES from '../data/emotes.json';
import * as SHITTY_EMOTES from '../data/shitty_emotes.json';
import { Interaction, Snowflake } from '../types/types';

export type EmojiKey = keyof typeof EMOTES | keyof typeof SHITTY_EMOTES;

export default class MiscUtils {
    bot: Bot;

    constructor(bot: Bot) {
        this.bot = bot;
    }

    getEmojiText(emojiKey: EmojiKey, guildID?: Snowflake, channelID?: Snowflake) {
        if (!guildID) {
            return EMOTES[emojiKey];
        }
        const matches = this.bot.perms.matchesMemberCache(this.bot.user.id, 'USE_EXTERNAL_EMOJIS', guildID, channelID);
        return matches ? EMOTES[emojiKey] : SHITTY_EMOTES[emojiKey];
    }

    // interaction replies are webhooks, so instead of the bot needing emoji perms, @everyone needs the perm
    getEmoji(emojiKey: EmojiKey, interaction: Interaction) {
        if (!interaction.guild_id) {
            return EMOTES[emojiKey];
        }
        const matches = this.bot.perms.matchesEveryoneCache('USE_EXTERNAL_EMOJIS', interaction.guild_id, interaction.channel_id);
        return matches ? EMOTES[emojiKey] : SHITTY_EMOTES[emojiKey];
    }
}