import Bot from '../structures/bot';
import * as EMOTES from '../data/emotes.json';
import * as SHITTY_EMOTES from '../data/shitty_emotes.json';
import { Snowflake } from '../types/types';
import * as os from 'os';

export type EmojiKey = keyof typeof EMOTES | keyof typeof SHITTY_EMOTES;

export default class MiscUtils {
    bot: Bot;

    constructor(bot: Bot) {
        this.bot = bot;
    }

    static getOSType() {
        const type = os.type();
        switch (type) {
            case 'Darwin':
                return 'macOS';
            case 'Windows_NT':
                return 'Windows';
            default:
                return type;
        }
    }

    getEmoji(emojiKey: EmojiKey, guildID?: Snowflake, channelID?: Snowflake) {
        if (!guildID) {
            return EMOTES[emojiKey];
        }
        const matches = this.bot.perms.matchesMemberCache(this.bot.user.id, 'USE_EXTERNAL_EMOJIS', guildID, channelID);
        return matches ? EMOTES[emojiKey] : SHITTY_EMOTES[emojiKey];
    }
}