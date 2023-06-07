import { PERMISSIONS } from '../../types/numberTypes.js';
import { CommandOptionValue, Embed, Interaction, Locale, Member, Role, Snowflake } from '../../types/types.js';
import CDNUtils from '../../utils/cdn.js';
import LangUtils from '../../utils/language.js';
import TextUtils from '../../utils/text.js';
import UnicodeUtils from '../../utils/unicode.js';
import InfoCommand from '../info.js';

function getKeyPermNames(role: Role, locale?: Locale): string[] {
    const perms: string[] = [];
    const bitfield = BigInt(role.permissions);
    if (bitfield & BigInt(PERMISSIONS.ADMINISTRATOR)) {
        perms.push(LangUtils.getPermissionName('ADMINISTRATOR', locale));
    } else {
        if (bitfield & BigInt(PERMISSIONS.MENTION_EVERYONE)) {
            perms.push(LangUtils.getPermissionName('MENTION_EVERYONE', locale));
        }
        if (bitfield & BigInt(PERMISSIONS.BAN_MEMBERS)) {
            perms.push(LangUtils.getPermissionName('BAN_MEMBERS', locale));
        }
        if (bitfield & BigInt(PERMISSIONS.KICK_MEMBERS)) {
            perms.push(LangUtils.getPermissionName('KICK_MEMBERS', locale));
        }
        if (bitfield & BigInt(PERMISSIONS.MANAGE_ROLES)) {
            perms.push(LangUtils.getPermissionName('MANAGE_ROLES', locale));
        }
        if (bitfield & BigInt(PERMISSIONS.MANAGE_CHANNELS)) {
            perms.push(LangUtils.getPermissionName('MANAGE_CHANNELS', locale));
        }
        if (bitfield & BigInt(PERMISSIONS.MANAGE_MESSAGES)) {
            perms.push(LangUtils.getPermissionName('MANAGE_MESSAGES', locale));
        }
    }
    return perms;
}

export default async function (this: InfoCommand, interaction: Interaction, roleID?: CommandOptionValue) {
    if (!interaction.guild_id) {
        return this.respondKeyReplace(interaction, 'GUILD_ONLY', { prefix: '/', command: this.name }, 'GUILD', true);
    }
    if (!roleID || typeof roleID !== 'string') {
        return this.handleUnexpectedError(interaction, 'ARGS_INVALID_TYPE');
    }

    let role: Role | null = null;
    if (interaction.data?.resolved?.roles && roleID in interaction.data.resolved.roles) {
        role = interaction.data.resolved.roles[roleID as Snowflake];
    }
    if (!role) {
        return this.handleUnexpectedError(interaction, 'ARGS_UNRESOLVED');
    }
    // NOTE: must create duplicate var to avoid error ts2531 in .filter() below
    // https://github.com/microsoft/TypeScript/issues/9998
    const typedRoleID: Snowflake = role.id;

    const guild = await this.bot.api.guild.fetch(interaction.guild_id, true).catch(() => null);
    if (!guild) {
        return this.respondKey(interaction, 'SERVER_INFO_FETCH_FAILED', 'ERROR', true);
    }


    const title = LangUtils.getAndReplace('ROLE_INFO_TITLE', {
        roleName: role.name
    }, interaction.locale);

    const totalRoles = Array.isArray(guild.roles) ? guild.roles.length : Object.keys(guild.roles).length;
    let description = LangUtils.getAndReplace('ROLE_INFO_POSITION', {
        position: role.position,
        total: totalRoles
    }, interaction.locale);

    const hexColor = role.color.toString(16).padStart(6, '0');
    description += '\n'+LangUtils.getAndReplace('ROLE_INFO_COLOR', { hexColor }, interaction.locale);

    // can't fetch total # of members in a role, see:
    // https://github.com/discord/discord-api-docs/discussions/3790
    // instead, only show online members in guilds > 1000 members
    let totalMembers = -1, onlineMembers = 0;
    const count = ('member_count' in guild) ? guild.member_count : guild.approximate_member_count;
    if (count) {
        const cached = this.bot.cache.guilds.get(interaction.guild_id)?.members;
        const cacheCount = cached ? Object.keys(cached).length : 0;
        let members: Member[] | null = null;
        if (cached && count === cacheCount) {
            members = Object.values(cached).filter(mem => mem.roles.includes(typedRoleID));
        } else if (count <= 1000) { 
            const allMembers = await this.bot.api.member.list(interaction.guild_id, 1000);
            if (allMembers) {
                members = allMembers.filter(mem => mem.roles.includes(typedRoleID));
            }
        } else if (cached) {
            // if only online members are cached, only update onlineMembers
            onlineMembers = Object.values(cached).filter(mem => {
                if (!mem.roles.includes(typedRoleID)) {
                    return false;
                }
                const presence = this.bot.cache.presences.get(mem.user.id);
                return presence && presence.status !== 'offline';
            }).length;
        }
        if (members) {
            totalMembers = members.length;
            onlineMembers = members.filter(mem => {
                const presence = this.bot.cache.presences.get(mem.user.id);
                return presence && presence.status !== 'offline';
            }).length;
        }
    }
    const onlineEmoji = this.getEmoji('ONLINE', interaction);
    description += '\n'+LangUtils.getAndReplace(`ROLE_INFO_MEMBERS${totalMembers === -1 ? '_ONLINE' : ''}`, {
        total: totalMembers,
        online: onlineMembers,
        onlineEmoji
    }, interaction.locale);

    const createdAt = TextUtils.timestamp.fromSnowflake(role.id);
    description += '\n'+LangUtils.formatDateAgo('CHANNEL_INFO_CREATED_AT', createdAt, interaction.locale);

    const keyPermNames = getKeyPermNames(role, interaction.locale);
    if (keyPermNames.length) {
        description += '\n'+LangUtils.getAndReplace('ROLE_INFO_PERMISSIONS', {
            keyPerms: keyPermNames.map(perm => `\`${perm}\``).join(', ')
        }, interaction.locale);
    }

    description += '\n\n'+LangUtils.get(`ROLE_INFO_${role.hoist ? '' : 'NOT_'}HOISTED`, interaction.locale);
    description += '\n'+LangUtils.get(`ROLE_INFO_${role.mentionable ? '' : 'NOT_'}MENTIONABLE`, interaction.locale);
    if (role.managed) {
        description += '\n'+LangUtils.get('ROLE_INFO_MANAGED', interaction.locale);
    }

    const embed: Embed = { title, description };

    if (role.color) {
        embed.color = role.color;
    }

    if (role.icon) {
        const iconURL = CDNUtils.roleIcon(role.id, role.icon);
        embed.thumbnail = { url: iconURL };
    } else if (role.unicode_emoji) {
        const charData = UnicodeUtils.getCharData(role.unicode_emoji);
        const emojiURL = charData ? UnicodeUtils.getImageFromCodes(charData.codepoints_utf16) : null;
        if (emojiURL) {
            embed.thumbnail = { url: emojiURL };
        }
    } else if (role.color) {
        embed.thumbnail = { url: `https://dummyimage.com/65x65/${hexColor}/${hexColor}` };
    }

    return this.respond(interaction, { embeds: [embed] });
}
