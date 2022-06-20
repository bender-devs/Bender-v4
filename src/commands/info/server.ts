import { DEFAULT_COLOR } from '../../data/constants';
import { VERIFICATION_LEVELS } from '../../types/numberTypes';
import * as types from '../../types/types';
import CDNUtils from '../../utils/cdn';
import DiscordUtils from '../../utils/discord';
import LangUtils from '../../utils/language';
import { EmojiKey } from '../../utils/misc';
import TextUtils from '../../utils/text';
import InfoCommand from '../info';

function getSecurityLevelText(this: InfoCommand, interaction: types.Interaction, level: VERIFICATION_LEVELS) {
    let key: EmojiKey;
    switch (level) {
        case VERIFICATION_LEVELS.VERY_HIGH: {
            key = 'SECURITY_VERY_HIGH';
            break;
        }
        case VERIFICATION_LEVELS.HIGH: {
            key = 'SECURITY_HIGH';
            break;
        }
        case VERIFICATION_LEVELS.MEDIUM: {
            key = 'SECURITY_MEDIUM';
            break;
        }
        case VERIFICATION_LEVELS.LOW: {
            key = 'SECURITY_LOW';
            break;
        }
        default: {
            key = 'SECURITY_NONE';
            break;
        }
    }
    return LangUtils.getAndReplace(`SERVER_INFO_${key}`, {
        securityEmoji: this.getEmoji(key, interaction)
    }, interaction.locale);
}

export default async function (this: InfoCommand, interaction: types.Interaction) {
    if (!interaction.guild_id) {
        return this.respondKey(interaction, 'GUILD_ONLY', 'GUILD');
    }

    const guild = await this.bot.api.guild.fetch(interaction.guild_id, true).catch(() => null); 
    if (!guild) {
        return this.respondKey(interaction, 'SERVER_INFO_FETCH_FAILED', 'ERROR');
    }

    const total = guild.approximate_member_count || this.bot.cache.members.size(guild.id);
    const bots = this.bot.cache.members.filter(guild.id, mem => mem.user.bot || false)?.length || 0;
    const online = guild.approximate_presence_count || this.bot.cache.members.filter(guild.id, mem => {
        return this.bot.cache.presences.get(mem.user.id)?.status !== 'offline';
    })?.length || 0;
    const memberInfo = LangUtils.getAndReplace('SERVER_INFO_MEMBERS', {
        usersEmoji: this.getEmoji('USERS', interaction),
        total: LangUtils.formatNumber(total, interaction.locale),
        bots: LangUtils.formatNumber(bots, interaction.locale),
        online: LangUtils.formatNumber(online, interaction.locale),
        onlineEmoji: this.getEmoji('ONLINE', interaction)
    }, interaction.locale);

    const owner = this.bot.cache.members.get(guild.id, guild.owner_id);
    const ownerInfo = LangUtils.getAndReplace(`SERVER_INFO_OWNER${owner ? '' : '_UNKNOWN'}`, {
        userEmoji: this.getEmoji('USER', interaction),
        owner: owner ? DiscordUtils.user.getTag(owner.user) : '',
        nickInfo: owner?.nick ? ` ~ ${owner.nick}` : ''
    }, interaction.locale);

    const createdAt = TextUtils.timestamp.fromSnowflake(guild.id);
    let createdInfo = LangUtils.formatDateAgo('SERVER_INFO_CREATED_AT', createdAt, interaction.locale);
    createdInfo = `${this.getEmoji('DATE', interaction)} ${createdInfo}`;

    const securityInfo = getSecurityLevelText.bind(this)(interaction, guild.verification_level);

    const textCount = this.bot.cache.channels.filter(guild.id, chan => DiscordUtils.channel.isText(chan))?.length || 0;
    const textInfo = LangUtils.getAndReplace(`SERVER_INFO_TEXT_CHANNEL_${textCount === 1 ? 'SINGLE' : 'COUNT'}`, {
        count: LangUtils.formatNumber(textCount),
        chanEmoji: this.getEmoji('CHANNEL_TEXT', interaction)
    }, interaction.locale);

    const voiceCount = this.bot.cache.channels.filter(guild.id, chan => DiscordUtils.channel.isVoice(chan))?.length || 0;
    const voiceInfo = LangUtils.getAndReplace(`SERVER_INFO_VOICE_CHANNEL_${textCount === 1 ? 'SINGLE' : 'COUNT'}`, {
        count: LangUtils.formatNumber(voiceCount),
        chanEmoji: this.getEmoji('CHANNEL_VOICE', interaction)
    }, interaction.locale);

    const roleCount = this.bot.cache.roles.size(guild.id);
    const roleInfo = LangUtils.getAndReplace(`SERVER_INFO_ROLE_${roleCount === 1 ? 'SINGLE' : 'COUNT'}`, {
        count: LangUtils.formatNumber(roleCount)
    }, interaction.locale);

    const emojiCount = this.bot.cache.emojis.size(guild.id);
    const emojiInfo = LangUtils.getAndReplace(`SERVER_INFO_EMOJI_${emojiCount === 1 ? 'SINGLE' : 'COUNT'}`, {
        count: LangUtils.formatNumber(emojiCount)
    }, interaction.locale);

    const embed: types.Embed = {
        color: DEFAULT_COLOR,
        description: `${memberInfo}\n${ownerInfo}\n${createdInfo}\n${securityInfo}\n\n${roleInfo} | ${emojiInfo} | ${textInfo} | ${voiceInfo}`,
        footer: { text: `ID: ${guild.id}` }
    };

    const icon = guild.icon ? CDNUtils.guildIcon(guild.id, guild.icon) : null;
    if (icon) {
        embed.thumbnail = { url: icon };
        embed.author = { name: guild.name, icon_url: icon };
    } else {
        embed.title = guild.name;
    }

    return this.respond(interaction, embed);
}
