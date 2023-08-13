import { CHANNEL_TYPES } from '../types/numberTypes.js';
import type { Channel, Member, PartialMember, Role, User } from '../types/types.js';
import TimeUtils from './time.js';

export default class DiscordUtils {
    static member = {
        getHighestRole: (member: Member | PartialMember, guildRoles: Role[]) => {
            let highest: Role | null = null;
            for (const role of guildRoles) {
                if (!highest || (role.position > highest.position && member.roles.includes(role.id))) {
                    highest = role;
                }
            }
            return highest;
        },
        getSortedRoles: (member: Member | PartialMember, guildRoles: Role[]) => {
            const sortedGuildRoles = DiscordUtils.roles.sort(guildRoles);
            return sortedGuildRoles.filter(role => member.roles.includes(role.id));
        },
        getColor: (member: Member | PartialMember, guildRoles: Role[]) => {
            let highestWithColor: Role | null = null;
            for (const role of guildRoles) {
                if (role.color && (!highestWithColor || (role.position > highestWithColor.position && member.roles.includes(role.id)))) {
                    highestWithColor = role;
                }
            }
            return highestWithColor?.color || null;
        },
        sortByJoinDate(members: Member[]) {
            return members.sort((a, b) => TimeUtils.parseTimestampMillis(a.joined_at) - TimeUtils.parseTimestampMillis(b.joined_at));
        }
    }

    static guild = {
        getHighestRole: (guildRoles: Role[]) => {
            let highest: Role | null = null;
            for (const role of guildRoles) {
                if (!highest || role.position > highest.position) {
                    highest = role;
                }
            }
            return highest;
        },
        getColor: (guildRoles: Role[]) => {
            let highestWithColor: Role | null = null;
            for (const role of guildRoles) {
                if (role.color && (!highestWithColor || role.position > highestWithColor.position)) {
                    highestWithColor = role;
                }
            }
            return highestWithColor?.color || null;
        }
    }

    static roles = {
        sort: (roles: Role[]) => {
            return roles.sort((a, b) => b.position - a.position);
        }
    }

    static channel = {
        getEveryonePerms: (channel: Channel) => {
            if (!channel.permission_overwrites || !channel.guild_id) {
                return null;
            }
            return channel.permission_overwrites.find(perm => perm.id === channel.guild_id) || null;
        },
        isText: (channel: Channel) => [CHANNEL_TYPES.GUILD_TEXT, CHANNEL_TYPES.GUILD_NEWS].includes(channel.type) || this.channel.isThread(channel),
        isThread: (channel: Channel) => [CHANNEL_TYPES.GUILD_NEWS_THREAD, CHANNEL_TYPES.GUILD_PUBLIC_THREAD, CHANNEL_TYPES.GUILD_PRIVATE_THREAD].includes(channel.type),
        isVoice: (channel: Channel) => [CHANNEL_TYPES.GUILD_VOICE, CHANNEL_TYPES.GUILD_STAGE_VOICE].includes(channel.type)
    }

    static user = {
        getTag: (user: User) => {
            const discrimInt = parseInt(user.discriminator);
            if (discrimInt) { // bot or user that hasn't migrated
                return `${user.username}#${user.discriminator}`;
            } else if (user.discriminator === '0000') { // webhook/system message author
                return user.username;
            } else { // user on new username system
                return `@${user.username}`;
            }
        }
    }
}