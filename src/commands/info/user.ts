import { DEFAULT_COLOR } from '../../data/constants';
import { PERMISSIONS } from '../../types/numberTypes';
import * as types from '../../types/types';
import { CachedGuild } from '../../structures/cacheHandler';
import CDNUtils from '../../utils/cdn';
import DiscordTypeUtils from '../../utils/discordTypes';
import LangUtils from '../../utils/language';
import MiscUtils from '../../utils/misc';
import InfoCommand from '../info';

export default async function (this: InfoCommand, interaction: types.Interaction, userID?: types.CommandOptionValue) {
    if (!userID || typeof userID !== 'string') {
        return this.handleUnexpectedError(interaction, 'ARGS_INVALID_TYPE');
    }
    let partialUser: types.PartialUser | null = null;
    if (interaction.data?.resolved?.users && userID in interaction.data.resolved.users) {
        partialUser = interaction.data.resolved.users[userID as types.Snowflake];
    }
    if (!partialUser) {
        return this.handleUnexpectedError(interaction, 'ARGS_UNRESOLVED');
    }
    const user = await this.bot.api.user.fetch(partialUser.id);
    if (!user) {
        return this.respondKey(interaction, 'USER_FETCH_FAILED');
    }

    let member: types.Member | types.PartialMember | null = null;
    if (interaction.data?.resolved?.members && userID in interaction.data.resolved.members) {
        member = interaction.data.resolved.members[userID as types.Snowflake];
    }
    let guild: types.Guild | CachedGuild | null = null;
    if (interaction.guild_id) {
        if (!member) {
            member = await this.bot.api.member.fetch(interaction.guild_id, user.id);
        }
        guild = await this.bot.api.guild.fetch(interaction.guild_id);
    }
    const embed: types.Embed = {
        color: user.accent_color || DEFAULT_COLOR,
        footer: { text: `ID: ${user.id}` }
    };
    let userRank = LangUtils.get(`USER_INFO_${user.bot ? 'BOT' : 'HUMAN'}`, interaction.locale);
    let boostStatus = '', joinDate = '', roles = '', nickInfo = '';
    let avatar = user.avatar ? CDNUtils.userAvatar(user.id, user.avatar) : CDNUtils.userDefaultAvatar(user.discriminator);
    if (guild) {
        const isOwner = user.id === guild.owner_id;
        if (isOwner) {
            userRank = LangUtils.get('USER_INFO_OWNER', interaction.locale);
        }
        if (member) {
            const noRolesText = LangUtils.get('USER_INFO_NO_ROLES', interaction.locale);
            roles = '\n\n' + (member.roles.length ? LangUtils.getAndReplace('USER_INFO_ROLES', {
                roles: member.roles.map(id => `<@&${id}>`).join(', ')
            }, interaction.locale) : noRolesText);
            joinDate = '\n' + LangUtils.formatDateAgo('USER_INFO_JOINED_AT', member.joined_at, interaction.locale);

            const roleList = await this.bot.api.role.list(guild.id);
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
                    roles = '\n\n' + LangUtils.getAndReplace('USER_INFO_ROLES', {
                        roles: sortedRoles.map(role => `<@&${role.id}>`).join(', ')
                    }, interaction.locale);
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
                boostStatus = '\n\n' + LangUtils.formatDateAgo('USER_INFO_BOOST_INFO', member.premium_since, interaction.locale);
            }

            if (member.nick) {
                nickInfo = ` ~ ${member.nick}`;
            }

            if (member.avatar) {
                avatar = CDNUtils.userAvatar(user.id, member.avatar);
            }
        }
    }
    const createdAt = MiscUtils.snowflakeToTimestamp(user.id);
    const creationInfo = LangUtils.formatDateAgo('USER_INFO_CREATED_AT', createdAt, interaction.locale);

    let bannerNote = '';
    if (user.banner) {
        bannerNote = `\n\n${LangUtils.get('USER_INFO_BANNER', interaction.locale)}`;
        embed.image = {
            url: CDNUtils.userBanner(user.id, user.banner, undefined, 256)
        };
    }

    const unknownStatus = LangUtils.get('USER_INFO_UNKNOWN_STATUS', interaction.locale);
    const userStatus = unknownStatus; // TODO: get user presence when possible

    const description = MiscUtils.truncate(`${userRank} | ${userStatus}\n${joinDate}\n${creationInfo}${boostStatus}${roles}`, 1500).replace(/, <@?&?\d*\.\.\.$/, ' ...');
    embed.description = description + bannerNote;
    embed.author = {
        name: `${user.username}#${user.discriminator}${nickInfo}`,
        icon_url: avatar
    };
    embed.thumbnail = {
        url: avatar
    };
    return this.respond(interaction, embed);
}
