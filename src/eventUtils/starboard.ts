import { DEFAULT_COLOR, ID_REGEX_EXACT } from '../data/constants.js';
import { STARBOARD_COUNT, STARBOARD_EMOJI } from '../data/defaults.js';
import type Bot from '../structures/bot.js';
import type { CachedGuild } from '../structures/cacheHandler.js';
import type { GuildDotFormatKey, GuildSettings } from '../types/dbTypes.js';
import type { MessageDeleteData, ReactionAddData, ReactionRemoveData } from '../types/gatewayTypes.js';
import type {
    Embed,
    Guild,
    Message,
    MessageData,
    //MessageDataAttachment,
    PartialEmoji,
    Snowflake,
} from '../types/types.js';
import DiscordUtils from '../utils/discord.js';
import LangUtils from '../utils/language.js';
import TextUtils from '../utils/text.js';
import TimeUtils from '../utils/time.js';
import EventUtilsItem from './eventUtilsItem.js';

export default class StarboardUtils extends EventUtilsItem {
    constructor(bot: Bot) {
        super(bot);
    }

    static SETTINGS = {
        REACTION: ['starboard'] satisfies GuildDotFormatKey[],
        MESSAGE_DELETE: ['starboard.messages'] satisfies GuildDotFormatKey[],
    };

    emojiMatches = (emoji: PartialEmoji, starboardSettings: GuildSettings['starboard']) => {
        if (!starboardSettings) {
            return false;
        }
        if (starboardSettings.emoji && ID_REGEX_EXACT.test(starboardSettings.emoji)) {
            // Starboard emoji is a custom emoji
            this.bot.logger.debug(
                'STARBOARD',
                `Comparing reaction emoji ID (${emoji.id}) with ID (${starboardSettings.emoji})`
            );
            if (emoji.id === null) {
                return false; // Reaction is not a custom emoji
            }
            return emoji.id === starboardSettings.emoji;
        } else if (starboardSettings.emoji) {
            // Starboard emoji is a Unicode emoji
            this.bot.logger.debug(
                'STARBOARD',
                `Comparing reaction emoji (${emoji.name}) with Unicode emoji (${starboardSettings.emoji})`
            );
            if (emoji.id !== null) {
                return false; // Reaction is a custom emoji
            }
            return emoji.name === starboardSettings.emoji;
        } else {
            this.bot.logger.debug(
                'STARBOARD',
                `Comparing reaction emoji (${emoji.name}) with default emoji (${STARBOARD_EMOJI})`
            );
            return emoji.name === STARBOARD_EMOJI;
        }
    };

    reactionAdd = async (eventData: ReactionAddData, guild: Guild | CachedGuild, settings: GuildSettings) => {
        if (!eventData.guild_id) {
            return null; // starboard only works in guilds
        }
        if (!settings.starboard || !settings.starboard.enabled || !settings.starboard.channel) {
            return; // Starboard is not active
        }
        if (settings.starboard.blacklist && settings.starboard.blacklist.includes(eventData.channel_id)) {
            this.bot.logger.debug('STARBOARD', 'Reaction added in blacklisted channel', eventData.channel_id);
            return; // Blacklisted channel
        }
        this.bot.logger.debug('STARBOARD', 'Reaction added', eventData);

        if (!this.emojiMatches(eventData.emoji, settings.starboard)) {
            return; // Not the starboard emoji
        }

        const starboardChannel = await this.bot.api.channel.fetch(settings.starboard.channel);
        if (!starboardChannel) {
            return; // Starboard channel not found
        }
        // TODO: check permissions of starboard channel

        // TODO: add optional guild_id once this is implemented
        const message = await this.bot.api.message.fetch(eventData.channel_id, eventData.message_id);
        if (!message) {
            this.bot.logger.debug('STARBOARD', 'Starred message not found', eventData.message_id);
            return; // Message not found
        }
        const reaction = message.reactions?.find((r) =>
            eventData.emoji.id === null ? r.emoji.name === eventData.emoji.name : r.emoji.id === eventData.emoji.id
        );
        const reactionCount = reaction?.count;
        if (reactionCount === undefined) {
            this.bot.logger.debug('STARBOARD', 'Reaction count not found', reaction);
            return; // Reaction count not found
        }

        const existingStarboardID = settings.starboard.messages?.[message.id];
        const minimumCount = settings.starboard.count ?? STARBOARD_COUNT;

        if (existingStarboardID) {
            const existingStarboardMessage = await this.bot.api.message.fetch(
                starboardChannel.id,
                existingStarboardID
            );
            if (!existingStarboardMessage) {
                this.bot.logger.debug('STARBOARD', 'Starboard message not found', existingStarboardID);
                return; // Message not found
            }
            const newMessageData = await this.generateStarboardMessage(
                eventData,
                guild,
                reactionCount,
                message,
                existingStarboardMessage
            );
            return this.bot.api.message.edit(existingStarboardMessage, newMessageData);
        } else if (reactionCount < minimumCount) {
            return; // Not enough reactions
        }

        const messageData = await this.generateStarboardMessage(eventData, guild, reactionCount, message);

        return this.bot.api.channel.send(starboardChannel.id, messageData).then((newMessage) => {
            if (!newMessage) {
                this.bot.logger.debug('STARBOARD', 'Failed to create starboard message', messageData);
                return;
            }
            return this.bot.db.guild
                .update(guild.id, `starboard.messages.${message.id}`, newMessage.id)
                .catch((err) => {
                    this.bot.logger.handleError('STARBOARD', 'Failed to save starboard message', err);
                    return null;
                });
        });
    };

    reactionRemove = async (
        eventData: ReactionRemoveData,
        guild: Guild | CachedGuild,
        settings: GuildSettings
    ) => {
        if (!settings.starboard || !settings.starboard.enabled || !settings.starboard.channel) {
            return; // Starboard is not active
        }
        const starboardChannel = await this.bot.api.channel.fetch(settings.starboard.channel);
        if (!starboardChannel) {
            return; // Channel not found
        }
        const existingStarboardID = settings.starboard.messages?.[eventData.message_id];
        if (!existingStarboardID) {
            return; // No existing starboard message
        }
        const existingStarboardMessage = await this.bot.api.message.fetch(
            starboardChannel.id,
            existingStarboardID
        );
        if (!existingStarboardMessage) {
            return; // Message not found
        }
        const message = await this.bot.api.message.fetch(eventData.channel_id, eventData.message_id);
        if (!message) {
            return; // Message not found
        }
        const reactionCount =
            message.reactions?.find((reaction) => {
                return this.emojiMatches(reaction.emoji, settings.starboard);
            })?.count ?? 0;
        // don't handle minimum count as starboard messages should not be deleted automatically

        const newMessageData = await this.generateStarboardMessage(
            eventData,
            guild,
            reactionCount,
            message,
            existingStarboardMessage
        );
        return this.bot.api.message.edit(existingStarboardMessage, newMessageData);
    };

    generateStarboardMessage = async (
        eventData: ReactionAddData,
        guild: Guild | CachedGuild,
        reactionCount: number,
        message: Message,
        existingStarboardMessage?: Message
    ): Promise<MessageData> => {
        const emojiText = TextUtils.emoji.format(eventData.emoji);
        const footer = LangUtils.getAndReplace(
            'MESSAGE_ID_FOOTER',
            { messageId: message.id },
            guild.preferred_locale
        );

        if (existingStarboardMessage) {
            // Only update the reaction count
            const messageDetails = existingStarboardMessage.content.split('   •   ', 2)[1] || '';
            const newContent = `# ${emojiText} **${reactionCount}**   •   ${messageDetails}`;
            return Object.assign({}, existingStarboardMessage, { content: newContent });
        }

        const embed: Embed = {
            author: {
                name: message.author.username,
                icon_url: DiscordUtils.user.avatar(message.author),
            },
            description: message.content,
            color: DEFAULT_COLOR, // TODO: get color from author roles
            timestamp: TimeUtils.parseTimestamp(TextUtils.timestamp.fromSnowflake(message.id)),
        };

        const media = DiscordUtils.message.getMedia(message);
        this.bot.logger.debug('STARBOARD', 'Message media', media);

        //const uploadMedia: MessageDataAttachment[] = [];
        let imageLinks = '';
        if (media.images.length === 1) {
            // TODO: video
            embed.image = { url: media.images[0] };
        } else if (media.images.length > 1) {
            imageLinks = `\n${media.images.join('\n')}`;
        }
        // embed.video field doesn't work
        if (media.videos.length) {
            imageLinks += `\n${media.videos.join('\n')}`;
            /*for (const video of media.videos) {
                uploadMedia.push({ name: 'video', file: video }); 
            }*/
        }

        const messageLink = TextUtils.message.getLinkByIDs(guild.id, eventData.channel_id, message.id);
        const messageData: MessageData = {
            // TODO: replace footer *italic* with -# subtext when it's re-implemented
            content: `# ${emojiText} **${reactionCount}**   •   ${messageLink}\n*${footer}*${imageLinks}`,
            embeds: [embed],
        };
        // TODO: resolve buffers from URLs
        // TODO: upload videos (maybe images too)
        // also decide how to handle non-Discord links

        return messageData;
    };

    messageDelete = (eventData: MessageDeleteData, guild: Guild | CachedGuild, settings: GuildSettings) => {
        if (!settings.starboard?.messages) {
            return;
        }

        let messageID: Snowflake;
        for (messageID in settings.starboard.messages) {
            if (settings.starboard.messages[messageID] === eventData.id) {
                return this.bot.db.guild.deleteValue(guild.id, `starboard.messages.${messageID}`).catch((err) => {
                    this.bot.logger.handleError('STARBOARD', 'Failed to remove starboard message', err);
                    return null;
                });
            }
            // TODO: handle deletion of starred message?
        }
    };
}
