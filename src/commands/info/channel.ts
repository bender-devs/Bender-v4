import { DEFAULT_COLOR } from '../../data/constants.js';
import IMAGES from '../../data/images.js';
import APIError from '../../structures/apiError.js';
import { API_ERRORS, CHANNEL_TYPES, PERMISSIONS } from '../../types/numberTypes.js';
import type * as types from '../../types/types.js';
import DiscordUtils from '../../utils/discord.js';
import LangUtils from '../../utils/language.js';
import TextUtils from '../../utils/text.js';
import TimeUtils from '../../utils/time.js';
import type InfoCommand from '../info.js';

const CATEGORY_MAX_CHANNELS = 10;

export default async function (
    this: InfoCommand,
    interaction: types.Interaction,
    channelID?: types.CommandOptionValue
) {
    if (!channelID || typeof channelID !== 'string') {
        return this.handleUnexpectedError(interaction, 'ARGS_INVALID_TYPE');
    }
    const chanID = channelID as types.Snowflake;
    let partialChannel: types.PartialChannel | null = null;
    if (interaction.data?.resolved?.channels && channelID in interaction.data.resolved.channels) {
        partialChannel = interaction.data.resolved.channels[chanID];
    }
    if (!partialChannel) {
        return this.handleUnexpectedError(interaction, 'ARGS_UNRESOLVED');
    }
    if (!('guild_id' in interaction)) {
        return this.respondKeyReplace(interaction, 'GUILD_ONLY', { command: this.name }, 'GUILD');
    }
    if (!(BigInt(partialChannel.permissions) & PERMISSIONS.VIEW_CHANNEL)) {
        return this.respondMissingPermissions(
            interaction,
            TextUtils.channel.format(chanID),
            ['VIEW_CHANNEL'],
            true
        );
    }
    const hasPermissionCached = this.bot.perms.matchesMemberCache(
        this.bot.user.id,
        'VIEW_CHANNEL',
        interaction.guild_id,
        chanID
    );
    if (hasPermissionCached === false) {
        return this.respondMissingPermissions(
            interaction,
            TextUtils.channel.format(chanID),
            ['VIEW_CHANNEL'],
            true
        );
    }
    // catch-22 situation here: if the channel isn't cached, there's no way to tell if the bot has permissions to fetch it, since you can't fetch the channel and its permission overrides
    // see https://github.com/discord/discord-api-docs/discussions/3310
    let channel: types.Channel | null = null;
    try {
        channel = await this.bot.api.channel.fetch(chanID);
    } catch (err) {
        if (err instanceof APIError && err.code === API_ERRORS.MISSING_ACCESS) {
            return this.respondMissingPermissions(interaction, TextUtils.channel.format(chanID), ['VIEW_CHANNEL']);
        }
        this.bot.logger.handleError('FETCH CHANNEL', err);
        return this.respondKey(interaction, 'CHANNEL_FETCH_FAILED', 'ERROR', { ephemeral: true });
    }
    if (!channel?.guild_id) {
        return this.respondKey(interaction, 'CHANNEL_NOT_FOUND', 'WARNING', { ephemeral: true });
    }

    const createdAt = TextUtils.timestamp.fromSnowflake(channel.id);
    let description = LangUtils.formatDateAgo('CHANNEL_INFO_CREATED_AT', createdAt, interaction.locale);

    const total = this.bot.cache.channels.size(interaction.guild_id);
    let line2 = LangUtils.getAndReplace(
        'CHANNEL_INFO_POSITION',
        {
            position: channel.position ? channel.position + 1 : '???',
            total: total || '???',
        },
        interaction.locale
    );

    let parentChannel: types.Channel | types.PartialChannel | null = null;
    if (channel.parent_id) {
        parentChannel = await this.bot.api.channel.fetch(channel.parent_id);
    }
    if (parentChannel) {
        line2 += ` | ${LangUtils.getAndReplace(
            'CHANNEL_INFO_CATEGORY',
            { categoryName: parentChannel.name as string },
            interaction.locale
        )}`;
    } else if (channel.type !== CHANNEL_TYPES.GUILD_CATEGORY) {
        line2 += ` | ${LangUtils.get('CHANNEL_INFO_NO_CATEGORY', interaction.locale)}`;
    }
    description += `\n${line2}`;

    const perms = DiscordUtils.channel.getEveryonePerms(channel);

    let title = '',
        iconURL: types.URL = IMAGES.channel;

    if (channel.type === CHANNEL_TYPES.GUILD_CATEGORY) {
        const category = channel as types.CategoryChannel;
        title = LangUtils.getAndReplace(
            'CHANNEL_INFO_TITLE_CATEGORY',
            { channelName: category.name },
            interaction.locale
        );
        iconURL = IMAGES.category;

        let channels = this.bot.cache.channels
            .listCategory(channel.guild_id, channel.id)
            ?.map((chan) => TextUtils.channel.format(chan.id));
        if (channels && channels.length > CATEGORY_MAX_CHANNELS) {
            const remainder = channels.length - CATEGORY_MAX_CHANNELS;
            channels = channels.slice(0, CATEGORY_MAX_CHANNELS);
            const truncatedMsg = LangUtils.getAndReplace(
                'CHANNEL_INFO_TRUNCATED',
                { count: remainder },
                interaction.locale
            );
            channels.push(`*${truncatedMsg}*`);
        }
        let channelsInfo = '';
        if (channels?.length) {
            channelsInfo = LangUtils.getAndReplace(
                'CHANNEL_INFO_CATEGORY_CHANNELS',
                { channelList: channels.join(', ') },
                interaction.locale
            );
        } else {
            channelsInfo = LangUtils.get('CHANNEL_INFO_CATEGORY_EMPTY', interaction.locale);
        }
        description += `\n${channelsInfo}`;
    } else if (DiscordUtils.channel.isVoice(channel)) {
        const voiceChannel = channel as types.VoiceBasedChannel;
        title = LangUtils.getAndReplace(
            'CHANNEL_INFO_TITLE_VOICE',
            { channelName: voiceChannel.name },
            interaction.locale
        );
        if (perms && BigInt(perms.deny) & PERMISSIONS.CONNECT) {
            iconURL = IMAGES.voice_locked;
        } else {
            iconURL = IMAGES.voice;
        }
    } else {
        const textChannel = channel as types.TextBasedChannel;
        title = LangUtils.getAndReplace(
            `CHANNEL_INFO_TITLE${channel.nsfw ? '_NSFW' : ''}`,
            { channelName: textChannel.name },
            interaction.locale
        );

        let topic = '';
        if (channel.topic) {
            topic = LangUtils.getAndReplace(
                'CHANNEL_INFO_TOPIC',
                { topic: TextUtils.truncate(channel.topic, 900) },
                interaction.locale
            );
        } else {
            topic = LangUtils.get('CHANNEL_INFO_NO_TOPIC', interaction.locale);
        }

        let lastActivityInfo = '';
        if (channel.last_message_id) {
            const lastMessageTimestamp = TextUtils.timestamp.fromSnowflake(channel.last_message_id);
            lastActivityInfo = LangUtils.getAndReplace(
                'CHANNEL_INFO_LAST_ACTIVITY',
                {
                    durationRelative: TimeUtils.relative(lastMessageTimestamp),
                },
                interaction.locale
            );
        } else {
            lastActivityInfo = LangUtils.get('CHANNEL_INFO_LAST_ACTIVITY_UNKNOWN', interaction.locale);
        }

        description += `\n${topic}\n${lastActivityInfo}`;

        if (perms && BigInt(perms.deny) & PERMISSIONS.CONNECT) {
            iconURL = IMAGES.channel_locked;
        } else if (channel.nsfw) {
            iconURL = IMAGES.channel_nsfw;
        }
    }

    const linkTitle = LangUtils.getAndReplace(
        'CHANNEL_INFO_LINK_TITLE',
        {
            linkEmoji: this.getEmoji('LINK', interaction),
        },
        interaction.locale
    );
    description += `\n\n[${linkTitle}](https://discord.com/channels/${channel.guild_id}/${channel.id})`;

    const embed: types.Embed = {
        description,
        author: {
            name: title,
            icon_url: iconURL,
        },
        thumbnail: { url: iconURL },
        color: DEFAULT_COLOR,
        footer: {
            text: `ID: ${channel.id}`,
        },
    };
    return this.respond(interaction, { embeds: [embed] });
}
