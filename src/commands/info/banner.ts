import { DEFAULT_COLOR } from '../../data/constants.js';
import * as types from '../../types/types.js';
import { CachedGuild } from '../../structures/cacheHandler.js';
import CDNUtils from '../../utils/cdn.js';
import LangUtils from '../../utils/language.js';
import InfoCommand from '../info.js';

export default async function (this: InfoCommand, interaction: types.Interaction, userID?: types.CommandOptionValue) {
    let partialUser: types.PartialUser | null = null;
    if (!userID && !interaction.guild_id) {
        if (!interaction.user) {
            return this.respondKey(interaction, 'BANNER_INFO_MISSING_USER', 'WARNING');
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
        if (!user.banner) {
            return this.respondKeyReplace(interaction, 'BANNER_INFO_USER_NO_BANNER', { name }, 'INFO');
        }
        const bannerLink = CDNUtils.userBanner(user.id, user.banner, undefined, 512);
        const title = LangUtils.getAndReplace('BANNER_INFO_TITLE', {
            name,
            bannerLink,
            bannerEmoji: this.getEmoji('BANNER', interaction)
        }, interaction.locale);

        const embed: types.Embed = {
            description: title,
            color: user.accent_color || DEFAULT_COLOR,
            image: {
                url: bannerLink
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

    if (!guild.banner) {
        return this.respondKey(interaction, 'BANNER_INFO_GUILD_NO_BANNER', 'INFO');
    }
    const bannerLink = CDNUtils.guildBanner(guild.id, guild.banner, undefined, 512);
    const title = LangUtils.getAndReplace('BANNER_INFO_TITLE', {
        name: guild.name,
        bannerLink,
        bannerEmoji: this.getEmoji('BANNER', interaction)
    }, interaction.locale);

    const embed: types.Embed = {
        description: title,
        color: DEFAULT_COLOR,
        image: {
            url: bannerLink
        }
    };
    return this.respond(interaction, { embeds: [embed] });
}
