import { DEFAULT_COLOR } from '../../data/constants';
import { PERMISSIONS } from '../../data/numberTypes';
import * as types from '../../data/types';
import { CachedGuild } from '../../utils/cacheHandler';
import CDNUtils from '../../utils/cdn';
import DiscordTypeUtils from '../../utils/discordTypes';
import LanguageUtils from '../../utils/language';
import MiscUtils from '../../utils/misc';
import TimeUtils from '../../utils/time';
import InfoCommand from '../info';

export default async function(this: InfoCommand, interaction: types.Interaction, user?: types.CommandOptionValue) {
    if (!user || typeof user === 'string' || typeof user === 'boolean' || typeof user === 'number' || !('discriminator' in user)) {
        return this.handleUnexpectedError(interaction, 'ARGS_INVALID_TYPE');
    }
    let member: types.Member | null = null;
    let guild: types.Guild | CachedGuild | null = null;
    if (interaction.guild_id) {
        member = await this.bot.fetch.member(interaction.guild_id, user.id);
        guild = await this.bot.fetch.guild(interaction.guild_id);
    }
    const embed: types.Embed = {
        color: user.accent_color || DEFAULT_COLOR,
        footer: { text: `ID: ${user.id}` }
    };
    let userRank = LanguageUtils.get(`USER_INFO_${user.bot ? 'BOT' : 'HUMAN'}`, interaction.locale);
    let boostStatus = '', joinDate = '', roles = '', nickInfo = '';
    let avatar = user.avatar ? CDNUtils.userAvatar(user.id, user.avatar) : CDNUtils.userDefaultAvatar(user.discriminator);
    if (guild) {
        const isOwner = user.id === guild.owner_id;
        if (isOwner) {
            userRank = LanguageUtils.get('USER_INFO_OWNER', interaction.locale);
        }
        if (member) {
            roles = '\n\n' + member.roles.map(id => `<@&${id}>`).join(', ');
            const joinedAtText = LanguageUtils.get('JOINED_AT', interaction.locale);
            const joinDuration = TimeUtils.sinceTimestamp(member.joined_at);
            const joinInfo = LanguageUtils.getAndReplace('SINCE_DATE_AGO', {
                date: TimeUtils.formatDate(member.joined_at),
                ago: TimeUtils.formatDuration(joinDuration, true, interaction.locale)
            });
            joinDate = `\n**${joinedAtText}:** ${joinInfo}`;
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
            } else if (!isOwner) {
                userRank = LanguageUtils.get('USER_INFO_MEMBER', interaction.locale);
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
                const date = TimeUtils.formatDate(member.premium_since);
                const ago = TimeUtils.formatDuration(duration, true, interaction.locale);
                boostStatus = '\n\n' + LanguageUtils.getAndReplace('SINCE_DATE_AGO', { date, ago }, interaction.locale);
            }

            if (member.nick) {
                nickInfo = ` ~ ${member.nick}`;
            }

            if (member.avatar) {
                avatar = CDNUtils.userAvatar(user.id, member.avatar);
            }
        }
    }
    const createdAtText = LanguageUtils.get('CREATED_AT', interaction.locale);
    const createdAt = MiscUtils.snowflakeToTimestamp(user.id);
    const userAge = TimeUtils.sinceMillis(createdAt);
    const userAgeInfo = LanguageUtils.getAndReplace('SINCE_DATE_AGO', {
        date: TimeUtils.formatDate(createdAt),
        ago: TimeUtils.formatDuration(userAge, true, interaction.locale)
    }, interaction.locale);
    const creationInfo = `**${createdAtText}:** ${userAgeInfo}`;

    const bannerNote = user.banner ? `\n\n**${LanguageUtils.get('BANNER', interaction.locale)}:**` : '';

    const userStatus = ''; // TODO: get user presence when possible

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