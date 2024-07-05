import { DEFAULT_COLOR } from '../../data/constants.js';
import type { CachedGuild } from '../../structures/cacheHandler.js';
import { PERMISSIONS } from '../../types/numberTypes.js';
import type * as types from '../../types/types.js';
import CDNUtils from '../../utils/cdn.js';
import DiscordUtils from '../../utils/discord.js';
import LangUtils from '../../utils/language.js';
import TextUtils from '../../utils/text.js';
import type InfoCommand from '../info.js';

export default async function (
    this: InfoCommand,
    interaction: types.Interaction,
    userID?: types.CommandOptionValue
) {
    if (userID && typeof userID !== 'string') {
        return this.handleUnexpectedError(interaction, 'ARGS_INVALID_TYPE');
    }
    let partialUser: types.PartialUser | null = null;
    if (userID) {
        if (interaction.data?.resolved?.users && userID in interaction.data.resolved.users) {
            partialUser = interaction.data.resolved.users[userID as types.Snowflake];
        }
    } else {
        partialUser = 'member' in interaction ? interaction.member.user : interaction.user;
    }
    if (!partialUser) {
        return this.handleUnexpectedError(interaction, 'ARGS_UNRESOLVED');
    }
    const user = await this.bot.api.user.fetch(partialUser.id);
    if (!user) {
        return this.respondKey(interaction, 'USER_FETCH_FAILED', 'ERROR', { ephemeral: true });
    }

    let footer = LangUtils.getAndReplace('USER_INFO_ID', { id: partialUser.id }, interaction.locale);

    let member: types.Member | types.PartialMember | null = null;
    if (interaction.data?.resolved?.members && partialUser.id in interaction.data.resolved.members) {
        member = interaction.data.resolved.members[userID as types.Snowflake];
    }
    let guild: types.Guild | CachedGuild | null = null;
    if ('guild_id' in interaction) {
        if (!member) {
            member = await this.bot.api.member.fetch(interaction.guild_id, user.id).catch(() => null);
        }
        guild = await this.bot.api.guild.fetch(interaction.guild_id);
        if (guild) {
            const count = 'member_count' in guild ? guild.member_count : guild.approximate_member_count;
            if (count) {
                let memIndex = -1;
                const cached = this.bot.cache.guilds.get(interaction.guild_id)?.members;
                const cacheCount = cached ? Object.keys(cached).length : 0;
                if (cached && count === cacheCount) {
                    const members = DiscordUtils.member.sortByJoinDate(Object.values(cached));
                    memIndex = members.findIndex((mem) => mem.user.id === userID);
                } else if (count <= 1000) {
                    let members = await this.bot.api.member.list(interaction.guild_id, 1000);
                    if (members) {
                        members = DiscordUtils.member.sortByJoinDate(members);
                        memIndex = members.findIndex((mem) => mem.user.id === userID);
                    }
                }
                if (memIndex > -1) {
                    const memNumberText = LangUtils.getAndReplace(
                        'USER_INFO_MEMBER_NUMBER',
                        { num: memIndex + 1 },
                        interaction.locale
                    );
                    footer = `${memNumberText} | ${footer}`;
                }
            }
        }
    }

    const embed: types.Embed = {
        color: user.accent_color || DEFAULT_COLOR,
        footer: { text: footer },
    };

    let userNames = DiscordUtils.user.getTag(user);
    if (user.global_name) {
        userNames = `${user.global_name} | ${userNames}`;
    }

    let userRank = LangUtils.getAndReplace(
        `USER_INFO_${user.bot ? 'BOT' : 'HUMAN'}`,
        {
            botEmoji: this.getEmoji('BOT', interaction),
            userEmoji: this.getEmoji('USER', interaction),
        },
        interaction.locale
    );
    let boostStatus = '',
        joinDate = '',
        roles = '',
        memberNote = '';
    let avatar = CDNUtils.resolveUserAvatar(user);
    if (guild) {
        const isOwner = user.id === guild.owner_id;
        if (isOwner) {
            userRank = LangUtils.getAndReplace(
                'USER_INFO_OWNER',
                {
                    ownerEmoji: this.getEmoji('OWNER', interaction),
                },
                interaction.locale
            );
        }
        if (member) {
            const noRolesText = LangUtils.get('USER_INFO_NO_ROLES', interaction.locale);
            roles = `\n\n${
                member.roles.length
                    ? LangUtils.getAndReplace(
                          'USER_INFO_ROLES',
                          {
                              roles: member.roles.map(TextUtils.mention.parseRole).join(', '),
                              count: member.roles.length,
                          },
                          interaction.locale
                      )
                    : noRolesText
            }`;
            joinDate = `\n${LangUtils.formatDateAgo('USER_INFO_JOINED_AT', member.joined_at, interaction.locale)}`;

            const roleList = await this.bot.api.role.list(guild.id);
            if (roleList && member.roles.length) {
                const highestRole = isOwner ? null : DiscordUtils.member.getHighestRole(member, roleList);
                if (highestRole) {
                    let roleIcon = '🔘';
                    const perms = BigInt(highestRole.permissions);
                    if (perms & PERMISSIONS.ADMINISTRATOR) {
                        roleIcon = '🛡';
                    } else if (perms & PERMISSIONS.BAN_MEMBERS) {
                        roleIcon = '🔨';
                    } else if (perms & PERMISSIONS.KICK_MEMBERS) {
                        roleIcon = '👢';
                    } else if (perms & PERMISSIONS.MANAGE_MESSAGES) {
                        roleIcon = '👮‍♀️';
                    }
                    userRank = `${roleIcon} ${highestRole.name}`;
                }
                const sortedRoles = DiscordUtils.member.getSortedRoles(member, roleList);
                if (sortedRoles.length) {
                    roles = `\n\n${LangUtils.getAndReplace(
                        'USER_INFO_ROLES',
                        {
                            roles: sortedRoles.map((role) => TextUtils.mention.parseRole(role.id)).join(', '),
                            count: sortedRoles.length,
                        },
                        interaction.locale
                    )}`;
                }
            } else if (!isOwner) {
                userRank = LangUtils.getAndReplace(
                    'USER_INFO_MEMBER',
                    {
                        userEmoji: this.getEmoji('USER', interaction),
                    },
                    interaction.locale
                );
            }
            if (roleList && !user.accent_color) {
                let color = DiscordUtils.member.getColor(member, roleList);
                if (!color) {
                    color = DiscordUtils.guild.getColor(roleList);
                }
                if (color) {
                    embed.color = color;
                }
            }

            if (member.premium_since) {
                boostStatus = `\n\n${LangUtils.formatDateAgo(
                    'USER_INFO_BOOST_INFO',
                    member.premium_since,
                    interaction.locale
                )}`;
            }

            if (member.nick) {
                userNames += ` | ${member.nick}`;
            }

            if (member.avatar) {
                avatar = CDNUtils.memberAvatar(guild.id, user.id, member.avatar);
            }
        } else {
            memberNote = `\n\n${LangUtils.get('USER_INFO_NON_MEMBER', interaction.locale)}`;
        }
    }
    const createdAt = TextUtils.timestamp.fromSnowflake(user.id);
    const creationInfo = LangUtils.formatDateAgo('USER_INFO_CREATED_AT', createdAt, interaction.locale);

    let bannerNote = '';
    if (user.banner) {
        bannerNote = `${memberNote ? '' : '\n'}\n${LangUtils.get('USER_INFO_BANNER', interaction.locale)}`;
        embed.image = {
            url: CDNUtils.userBanner(user.id, user.banner, undefined, 256),
        };
    }

    let userStatus: string | null = null;
    if (member) {
        userStatus = this.bot.utils.getStatus(user.id, interaction);
        if (!userStatus) {
            const statusEmoji = this.getEmoji('OFFLINE', interaction);
            const statusText = LangUtils.get(`STATUS_OFFLINE`, interaction.locale);
            userStatus = `${statusEmoji} ${statusText}`;
        }
    } else {
        // if not a member, don't show status (sandboxing)
        userStatus = LangUtils.get('USER_INFO_UNKNOWN_STATUS', interaction.locale);
    }

    const description = TextUtils.truncate(
        `${userRank} | ${userStatus}\n${joinDate}\n${creationInfo}${boostStatus}${roles}`,
        1500
    ).replace(/, <@?&?\d*\.\.\.$/, ' ...');
    embed.description = `${description}${memberNote}${bannerNote}`;
    embed.author = {
        name: userNames,
        icon_url: avatar,
    };
    embed.thumbnail = {
        url: avatar,
    };
    return this.respond(interaction, { embeds: [embed] });
}
