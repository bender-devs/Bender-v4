import { DEFAULT_COLOR } from '../../data/constants';
import * as types from '../../types/types';
import { CachedGuild } from '../../structures/cacheHandler';
import CDNUtils from '../../utils/cdn';
import LangUtils from '../../utils/language';
import InfoCommand from '../info';

export default async function (this: InfoCommand, interaction: types.Interaction, userID?: types.CommandOptionValue) {
    let partialUser: types.PartialUser | null = null;
    if (!userID && !interaction.guild_id) {
        if (!interaction.user) {
            return this.respondKey(interaction, 'AVATAR_INFO_MISSING_USER', 'WARNING');
        }
        userID = interaction.user.id;
        partialUser = interaction.user;
    }
    const userIDSnowflake = userID ? userID as types.Snowflake : null;
    if (userIDSnowflake && !partialUser) {
        if (interaction.data?.resolved?.users && userIDSnowflake in interaction.data.resolved.users) {
            partialUser = interaction.data.resolved.users[userID as types.Snowflake];
        }
    }
    let user: types.User | null = null;
    if (userIDSnowflake) {
        if (!partialUser) {
            return this.handleUnexpectedError(interaction, 'ARGS_UNRESOLVED');
        }
        user = await this.bot.api.user.fetch(partialUser.id);
        if (!user) {
            return this.respondKey(interaction, 'USER_FETCH_FAILED', 'ERROR');
        }
    }
    let member: types.Member | types.PartialMember | null = null;
    if (userIDSnowflake && interaction.data?.resolved?.members && userIDSnowflake in interaction.data.resolved.members) {
        member = interaction.data.resolved.members[userIDSnowflake];
    }

    if (user) {
        const name = member?.nick ?? user.username;
        if (!user.avatar) {
            return this.respondKeyReplace(interaction, 'AVATAR_INFO_USER_NO_AVATAR', { name }, 'INFO');
        }
        const avatarLink = CDNUtils.userAvatar(user.id, user.avatar, undefined, 2048);
        const title = LangUtils.getAndReplace('AVATAR_INFO_USER_TITLE', {
            name,
            avatarLink,
            avatarEmoji: this.getEmoji('AVATAR', interaction)
        }, interaction.locale);

        const embed: types.Embed = {
            description: title,
            color: user.accent_color || DEFAULT_COLOR,
            image: {
                url: avatarLink
            }
        };
        return this.respond(interaction, { embeds: [embed] });
    }

    let guild: types.Guild | CachedGuild | null = null;
    if (interaction.guild_id) {
        guild = await this.bot.api.guild.fetch(interaction.guild_id);
    }
    if (!guild) {
        return this.respondKey(interaction, 'USER_OR_GUILD_NOT_FOUND', 'WARNING');
    }

    if (!guild.icon) {
        return this.respondKey(interaction, 'AVATAR_INFO_GUILD_NO_AVATAR', 'INFO');
    }
    const avatarLink = CDNUtils.guildIcon(guild.id, guild.icon, undefined, 2048);
    const title = LangUtils.getAndReplace('AVATAR_INFO_GUILD_TITLE', {
        name: guild.name,
        avatarLink,
        avatarEmoji: this.getEmoji('AVATAR', interaction)
    }, interaction.locale);

    const embed: types.Embed = {
        description: title,
        color: DEFAULT_COLOR,
        image: {
            url: avatarLink
        }
    };

    return this.respond(interaction, { embeds: [embed] });
}
