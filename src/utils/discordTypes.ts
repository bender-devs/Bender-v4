import { Member, Role } from '../data/types';

export default class DiscordTypeUtils {
    static member = {
        getHighestRole: (member: Member, guildRoles: Role[]) => {
            let highest: Role | null = null;
            for (const role of guildRoles) {
                if (!highest || role.position > highest.position && member.roles.includes(role.id)) {
                    highest = role;
                }
            }
            return highest;
        },
        getColor: (member: Member, guildRoles: Role[]) => {
            const highestRole = DiscordTypeUtils.member.getHighestRole(member, guildRoles);
            return highestRole?.color || null;
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
            const highestRole = DiscordTypeUtils.guild.getHighestRole(guildRoles);
            return highestRole?.color || null;
        }
    }
}