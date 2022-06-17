import { ID_REGEX_EXACT, OWNERS } from '../data/constants';
import { PERMISSIONS, ALL_PERMISSIONS, PERMISSION_OVERWRITE_TYPES } from '../types/numberTypes';
import { BenderPermission, Bitfield, Channel, DiscordPermission, Flags, Member, PermissionName, PermissionOverwrites, RoleHierarchyPermission, Snowflake, User } from '../types/types'; 
import CacheHandler, { CachedGuild } from '../structures/cacheHandler';

type PermBitfield = Bitfield | Flags | bigint;
type SimplifiedOverwrites = {
    allow: bigint;
    deny: bigint;
}
const allPermissions = Object.keys(PERMISSIONS) as PermissionName[];

export default class PermissionUtils {
    static has(bitfield: PermBitfield, permission: PermissionName) {
        const numberBitfield = BigInt(bitfield);
        const permissionFlag = BigInt(PERMISSIONS[permission]);

        return (numberBitfield & permissionFlag) ? true : false;
    }

    static #hasMany(bitfield: PermBitfield, permissions: PermissionName[], onlySome: boolean) {
        const numberBitfield = BigInt(bitfield);
        for (const permission of permissions) {
            const permissionFlag = BigInt(PERMISSIONS[permission]);
            if (onlySome && numberBitfield & permissionFlag) {
                return true;
            } else if (!onlySome && !(numberBitfield & permissionFlag)) {
                return false;
            }
        }
        return !onlySome;
    }

    static hasAll(bitfield: PermBitfield, permissions: PermissionName[]) {
        return this.#hasMany(bitfield, permissions, false);
    }

    static hasSome(bitfield: PermBitfield, permissions: PermissionName[]) {
        return this.#hasMany(bitfield, permissions, true);
    }

    static computeOverwritesForMember(member: Member, overwrites: PermissionOverwrites[] = []): SimplifiedOverwrites {
        const bitfields: SimplifiedOverwrites = {
            allow: BigInt(0),
            deny: BigInt(0)
        }
        for (const overwrite of overwrites) {
            const memberMatch = overwrite.type === PERMISSION_OVERWRITE_TYPES.MEMBER && overwrite.id === member.user.id;
            const roleMatch = overwrite.type === PERMISSION_OVERWRITE_TYPES.ROLE && member.roles.includes(overwrite.id);
            if (memberMatch || roleMatch) {
                bitfields.allow |= BigInt(overwrite.allow);
                bitfields.deny |= BigInt(overwrite.deny);
            }
        }
        return bitfields;
    }

    static computeBitfieldFromOverwrite(overwrite: SimplifiedOverwrites, rolePerms: bigint): bigint {
        if (rolePerms & BigInt(PERMISSIONS.ADMINISTRATOR)) {
            return BigInt(ALL_PERMISSIONS);
        }
        let bitfield = BigInt(0);
        for (const perm of allPermissions) {
            const bit = BigInt(PERMISSIONS[perm]);

            const allow = overwrite.allow & bit;
            const deny = overwrite.deny & bit;
            const roleAllow = rolePerms & bit;

            if (allow || (roleAllow && !deny)) {
                bitfield |= bit;
            }
        }
        return bitfield;
    }

    static computeBitfieldFromRoles(roleIDs: Snowflake[], guild: CachedGuild): bigint {
        const everyonePerms = BigInt(guild.roles[guild.id]?.permissions || 0);
        if (everyonePerms & BigInt(PERMISSIONS.ADMINISTRATOR)) {
            return BigInt(ALL_PERMISSIONS); // don't waste computing power on people that are dumb enough to do this
        }
        let bitfield = everyonePerms;
        for (const roleID of roleIDs) {
            const role = guild.roles[roleID];
            if (!role) {
                continue;
            }
            bitfield |= BigInt(role.permissions);
        }
        return bitfield;
    }

    static computeBitfieldForMember(member: Member, guild: CachedGuild, channel?: Channel): bigint {
        if (member.user.id === guild.owner_id) {
            return BigInt(ALL_PERMISSIONS);
        }
        const rolePerms = this.computeBitfieldFromRoles(member.roles, guild);
        if (rolePerms & BigInt(PERMISSIONS.ADMINISTRATOR)) {
            return BigInt(ALL_PERMISSIONS);
        }
        if (channel) {
            const overwrite = this.computeOverwritesForMember(member, channel.permission_overwrites);
            return this.computeBitfieldFromOverwrite(overwrite, rolePerms);
        }
        return rolePerms;
    }

    static matchesMember(member: Member, perm: BenderPermission, guild: CachedGuild, channel?: Channel) {
        if (Array.isArray(perm)) {
            for (const roleID of perm) {
                for (const memberRoleID of member.roles) {
                    if (roleID === memberRoleID) {
                        return true;
                    }
                }
            }
            return false;
        }
        if (ID_REGEX_EXACT.test(perm)) {
            const roleID = perm as RoleHierarchyPermission;
            return member.roles.includes(roleID);
        }
        const discordPerm = perm as DiscordPermission;
        if (member.permissions) {
            return this.has(member.permissions, discordPerm);
        }
        const bitfield = this.computeBitfieldForMember(member, guild, channel);
        return this.has(bitfield, discordPerm);
    }

    static matchesMemberCache(cache: CacheHandler, userID: Snowflake, perm: BenderPermission, guildID: Snowflake, channelID?: Snowflake) {
        const guild = cache.guilds.get(guildID);
        const member = cache.members.get(guildID, userID);
        if (!guild || !member) {
            return null;
        }
        const channel = channelID ? cache.channels.get(guildID, channelID) || undefined : undefined;
        return PermissionUtils.matchesMember(member, perm, guild, channel);
    }

    static isOwner(user?: User | Snowflake) {
        if (!user) {
            return false;
        }
        const id = typeof user === 'string' ? user : user.id;
        return OWNERS.includes(id);
    }
}