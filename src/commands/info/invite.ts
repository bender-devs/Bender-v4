import { DEFAULT_COLOR, INVITE_CODE_REGEX } from '../../data/constants';
import { Channel, CommandOptionValue, Embed, ExtendedInvite, Interaction, URL } from '../../types/types';
import CDNUtils from '../../utils/cdn';
import DiscordUtils from '../../utils/discord';
import LangUtils from '../../utils/language';
import TextUtils from '../../utils/text';
import TimeUtils from '../../utils/time';
import InfoCommand from '../info';

export default async function (this: InfoCommand, interaction: Interaction, inviteString?: CommandOptionValue) {
    if (!inviteString || typeof inviteString !== 'string') {
        return this.handleUnexpectedError(interaction, 'ARGS_INVALID_TYPE');
    }
    let inviteCode = '';
    if (INVITE_CODE_REGEX.test(inviteString)) {
        inviteCode = inviteString;
    } else {
        inviteCode = TextUtils.inviteLink.extract(inviteString) || '';
    }
    if (!inviteCode) {
        return this.respondKey(interaction, 'INVITE_INFO_LINK_INVALID', 'WARNING');
    }

    const invite = await this.bot.api.invite.fetch(inviteCode).catch(() => null);
    if (!invite?.guild) {
        return this.respondKey(interaction, 'INVITE_INFO_FETCH_FAILED', 'ERROR');
    }

    const userID = interaction.member?.user.id;
    let fullInvite: ExtendedInvite | null = null;
    if (userID && invite.guild.id === interaction.guild_id && this.bot.perms.matchesMemberCache(userID, 'MANAGE_GUILD', interaction.guild_id)) {
        const invites = await this.bot.api.invite.list(interaction.guild_id).catch(() => null);
        if (invites) {
            fullInvite = invites.find(inv => inv.code === inviteCode) || null;
        }
    }

    let description = `**ID:** ${invite.guild.id}`;
    if (invite.channel) {
        let cachedChannel: Channel | null = null;
        if (invite.guild.id === interaction.guild_id) {
            cachedChannel = this.bot.cache.channels.get(interaction.guild_id, invite.channel.id);
        } else {
            cachedChannel = this.bot.cache.channels.find(invite.channel.id);
        }
        const isVoice = cachedChannel && DiscordUtils.channel.isVoice(cachedChannel);
        description += `\n${LangUtils.getAndReplace(`INVITE_INFO${isVoice ? '_VOICE' : ''}_CHANNEL`, {
            channel: invite.guild.id === interaction.guild_id ? `<#${invite.channel.id}>` : `#${invite.channel.name}`
        }, interaction.locale)}`;
    }

    if (fullInvite?.uses) {
        const uses = LangUtils.formatNumber(fullInvite.uses, interaction.locale);
        const maxUses = fullInvite.max_uses ? LangUtils.formatNumber(fullInvite.max_uses, interaction.locale) : '';
        const useInfo = maxUses ? `${uses}/${maxUses}` : uses;
        description += `\n${LangUtils.getAndReplace('INVITE_INFO_USES', { useInfo }, interaction.locale)}`;
    }

    if (invite.expires_at) {
        const durationMillis = TimeUtils.untilTimestamp(invite.expires_at);
        const duration = TimeUtils.formatDuration(durationMillis, interaction.locale);
        description += `\n${LangUtils.getAndReplace('INVITE_INFO_EXPIRES_IN', { duration }, interaction.locale)}`;
    }

    const embed: Embed = {
        color: DEFAULT_COLOR,
        description
    };

    if (invite.inviter) {
        const userTag = DiscordUtils.user.getTag(invite.inviter);
        const userText = LangUtils.getAndReplace('INVITE_INFO_CREATED_BY', { user: userTag }, interaction.locale);

        let userAvatar: URL | null = null;
        if (invite.inviter.avatar) {
            userAvatar = CDNUtils.userAvatar(invite.inviter.id, invite.inviter.avatar);
        } else {
            userAvatar = CDNUtils.userDefaultAvatar(invite.inviter.discriminator);
        }
        
        embed.footer = {
            text: userText,
            icon_url: userAvatar
        };
    }

    if (invite.guild.icon) {
        const icon_url = CDNUtils.guildIcon(invite.guild.id, invite.guild.icon);
        embed.author = { name: invite.guild.name, icon_url };
        embed.thumbnail = { url: icon_url };
    } else {
        embed.title = invite.guild.name;
    }

    if (invite.approximate_presence_count && invite.approximate_member_count) {
        const presenceInfo = LangUtils.getAndReplace('INVITE_INFO_MEMBER_PRESENCES', {
            online: invite.approximate_presence_count,
            total: invite.approximate_member_count,
            onlineEmoji: this.getEmoji('ONLINE', interaction)
        }, interaction.locale);
        embed.fields = [{
            name: LangUtils.get('INVITE_INFO_MEMBERS', interaction.locale),
            value: presenceInfo
        }];
    }

    return this.respond(interaction, embed);
}
