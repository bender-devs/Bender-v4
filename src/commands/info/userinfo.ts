import { DEFAULT_COLOR } from '../../data/constants';
import { PERMISSIONS } from '../../data/numberTypes';
import * as types from '../../data/types';
import { CachedGuild } from '../../utils/cacheHandler';
import CDNUtils from '../../utils/cdn';
import DiscordTypeUtils from '../../utils/discordTypes';
import LangUtils from '../../utils/language';
import MiscUtils from '../../utils/misc';
import TimeUtils from '../../utils/time';
import InfoCommand from '../info';

export default async function (this: InfoCommand, interaction: types.Interaction, userID?: types.CommandOptionValue) {
    if (!userID || typeof userID !== 'string') {
        return this.handleUnexpectedError(interaction, 'ARGS_INVALID_TYPE');
    }
    let user: types.User | null = null;
    if (interaction.data?.resolved?.users && userID in interaction.data.resolved.users) {
        user = interaction.data.resolved.users[userID as types.Snowflake];
    }
    if (!user) {
        return this.handleUnexpectedError(interaction, 'ARGS_UNRESOLVED');
    }
    let member: types.Member | types.PartialMember | null = null;
    if (interaction.data?.resolved?.members && userID in interaction.data.resolved.members) {
        member = interaction.data.resolved.members[userID as types.Snowflake];
    }
    let guild: types.Guild | CachedGuild | null = null;
    if (interaction.guild_id) {
        if (!member) {
            member = await this.bot.fetch.member(interaction.guild_id, user.id);
        }
        guild = await this.bot.fetch.guild(interaction.guild_id);
    }
    const embed: types.Embed = {
        color: user.accent_color || DEFAULT_COLOR,
        footer: { text: `ID: ${user.id}` }
    };
    let userRank = LangUtils.getAndReplace(`USER_INFO_${user.bot ? 'BOT' : 'HUMAN'}`, {}, interaction.locale);
    let boostStatus = '', joinDate = '', roles = '', nickInfo = '';
    let avatar = user.avatar ? CDNUtils.userAvatar(user.id, user.avatar) : CDNUtils.userDefaultAvatar(user.discriminator);
    if (guild) {
        const isOwner = user.id === guild.owner_id;
        if (isOwner) {
            userRank = LangUtils.get('USER_INFO_OWNER', interaction.locale);
        }
        if (member) {

            const noRolesText = LangUtils.get('NO_ROLES', interaction.locale);
            roles = '\n\n' + (member.roles.map(id => `<@&${id}>`).join(', ') || noRolesText);
            const joinedAtText = LangUtils.get('JOINED_AT', interaction.locale);
            const joinDuration = TimeUtils.sinceTimestamp(member.joined_at);
            const joinedDate = TimeUtils.formatDate(member.joined_at, interaction.locale);
            const joinedAgo = TimeUtils.formatDuration(joinDuration, true, interaction.locale);
            joinDate = `\n**${joinedAtText}:** ${joinedDate} (${joinedAgo})`;

            const roleList = await this.bot.fetch.guildRoles(guild.id);
            if (roleList && member.roles.length) {
                const highestRole = DiscordTypeUtils.member.getHighestRole(member, roleList);
                if (highestRole) {
                    let roleIcon = '🔘';
                    const perms = BigInt(highestRole.permissions);
                    if (perms & BigInt(PERMISSIONS.ADMINISTRATOR)) {
                        roleIcon = '🛡';
                    } else if (perms & BigInt(PERMISSIONS.BAN_MEMBERS)) {
                        roleIcon = '🔨';
                    } else if (perms & BigInt(PERMISSIONS.KICK_MEMBERS)) {
                        roleIcon = '👢';
                    } else if (perms & BigInt(PERMISSIONS.MANAGE_MESSAGES)) {
                        roleIcon = '👮‍♀️';
                    }
                    userRank = `${roleIcon} ${highestRole.name}`;
                }
                const sortedRoles = DiscordTypeUtils.member.getSortedRoles(member, roleList);
                if (sortedRoles.length) {
                    roles = '\n\n' + sortedRoles.map(role => `<@&${role.id}>`).join(', ');
                }
            } else if (!isOwner) {
                userRank = LangUtils.get('USER_INFO_MEMBER', interaction.locale);
            }
            if (roleList && !user.accent_color) {
                let color = DiscordTypeUtils.member.getColor(member, roleList);
                if (!color) {
                    color = DiscordTypeUtils.guild.getColor(roleList);
                }
                if (color) {
                    embed.color = color;
                }
            }

            if (member.premium_since) {
                const duration = TimeUtils.sinceTimestamp(member.premium_since);
                const date = TimeUtils.formatDate(member.premium_since, interaction.locale);
                const ago = TimeUtils.formatDuration(duration, true, interaction.locale);
                boostStatus = '\n\n' + LangUtils.getAndReplace('SINCE_DATE_AGO', { date, ago }, interaction.locale);
            }

            if (member.nick) {
                nickInfo = ` ~ ${member.nick}`;
            }

            if (member.avatar) {
                avatar = CDNUtils.userAvatar(user.id, member.avatar);
            }
        }
    }
    const createdAtText = LangUtils.get('CREATED_AT', interaction.locale);
    const createdAt = MiscUtils.snowflakeToTimestamp(user.id);
    const createdDuration = TimeUtils.sinceMillis(createdAt);
    const createdDate = TimeUtils.formatDate(createdAt, interaction.locale);
    const createdAgo = TimeUtils.formatDuration(createdDuration, true, interaction.locale);
    const creationInfo = `**${createdAtText}:** ${createdDate} (${createdAgo})`;

    const bannerNote = user.banner ? `\n\n**${LangUtils.get('BANNER', interaction.locale)}:**` : '';

    const unknownStatus = LangUtils.get('UNKNOWN_STATUS', interaction.locale);
    const userStatus = `*${unknownStatus}*`; // TODO: get user presence when possible

    const description = MiscUtils.truncate(`${userRank} | ${userStatus}\n${joinDate}\n${creationInfo}${boostStatus}${roles}`, 1500).replace(/, <@?&?\d*\.\.\.$/, ' ...');
    embed.description = description + bannerNote;
    embed.author = {
        name: `${user.username}#${user.discriminator}${nickInfo}`,
        icon_url: avatar
    };
    embed.thumbnail = {
        url: avatar
    };
    return this.respondEmbed(interaction, embed);
}
