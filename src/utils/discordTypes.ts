import { Member, PartialMember, Role } from '../data/types';

export default class DiscordTypeUtils {
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
            const sortedGuildRoles = DiscordTypeUtils.roles.sort(guildRoles);
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
}