import { CHANNEL_TYPES } from '../types/numberTypes.js';
import type {
    Channel,
    Member,
    Message,
    PartialMember,
    Role,
    Snowflake,
    URL,
    User,
    WebhookUser,
} from '../types/types.js';
import type { ImageFormatAnimated, ImageSize } from './cdn.js';
import CDNUtils from './cdn.js';
import TimeUtils from './time.js';

type MediaResult = { images: URL[]; videos: URL[] };

export default class DiscordUtils {
    static member = {
        highestRole: (member: Member | PartialMember, guildRoles: Role[]) => {
            let highest: Role | null = null;
            for (const role of guildRoles) {
                if (!highest || (role.position > highest.position && member.roles.includes(role.id))) {
                    highest = role;
                }
            }
            return highest;
        },
        sortedRoles: (member: Member | PartialMember, guildRoles: Role[]) => {
            const sortedGuildRoles = DiscordUtils.roles.sort(guildRoles);
            return sortedGuildRoles.filter((role) => member.roles.includes(role.id));
        },
        color: (member: Member | PartialMember, guildRoles: Role[]) => {
            let highestWithColor: Role | null = null;
            for (const role of guildRoles) {
                if (
                    role.color &&
                    (!highestWithColor ||
                        (role.position > highestWithColor.position && member.roles.includes(role.id)))
                ) {
                    highestWithColor = role;
                }
            }
            return highestWithColor?.color || null;
        },
        sortByJoinDate(members: Member[]) {
            return members.sort(
                (a, b) => TimeUtils.parseTimestampMillis(a.joined_at) - TimeUtils.parseTimestampMillis(b.joined_at)
            );
        },
    };

    static guild = {
        highestRole: (guildRoles: Role[]) => {
            let highest: Role | null = null;
            for (const role of guildRoles) {
                if (!highest || role.position > highest.position) {
                    highest = role;
                }
            }
            return highest;
        },
        color: (guildRoles: Role[]) => {
            let highestWithColor: Role | null = null;
            for (const role of guildRoles) {
                if (role.color && (!highestWithColor || role.position > highestWithColor.position)) {
                    highestWithColor = role;
                }
            }
            return highestWithColor?.color || null;
        },
    };

    static roles = {
        sort: (roles: Role[]) => {
            return roles.sort((a, b) => b.position - a.position);
        },
    };

    static channel = {
        getEveryonePerms: (channel: Channel) => {
            if (!channel.permission_overwrites || !channel.guild_id) {
                return null;
            }
            return channel.permission_overwrites.find((perm) => perm.id === channel.guild_id) || null;
        },
        isText: (channel: Channel) =>
            [CHANNEL_TYPES.GUILD_TEXT, CHANNEL_TYPES.GUILD_NEWS].includes(channel.type) ||
            this.channel.isThread(channel),
        isThread: (channel: Channel) =>
            [
                CHANNEL_TYPES.GUILD_NEWS_THREAD,
                CHANNEL_TYPES.GUILD_PUBLIC_THREAD,
                CHANNEL_TYPES.GUILD_PRIVATE_THREAD,
            ].includes(channel.type),
        isVoice: (channel: Channel) =>
            [CHANNEL_TYPES.GUILD_VOICE, CHANNEL_TYPES.GUILD_STAGE_VOICE].includes(channel.type),
    };

    static user = {
        tag: (user: User) => {
            const discrimInt = parseInt(user.discriminator);
            if (discrimInt) {
                // bot or user that hasn't migrated
                return `${user.username}#${user.discriminator}`;
            } else if (user.discriminator === '0000') {
                // webhook/system message author
                return user.username;
            } else {
                // user on new username system
                return `@${user.username}`;
            }
        },
        avatar: (
            user: User | WebhookUser,
            memberData?: { member: Member | PartialMember; guild_id: Snowflake },
            format?: ImageFormatAnimated,
            size?: ImageSize
        ): URL => {
            if (memberData?.member?.avatar) {
                return CDNUtils.memberAvatar(memberData.guild_id, user.id, memberData.member.avatar, format, size);
            }
            return CDNUtils.resolveUserAvatar(user, format, size);
        },
    };

    static message = {
        /** Get an image or video from a message */
        getImage: (message: Message) => {
            return this.message.getImages(message)[0];
        },
        /** Get all images and videos from a message */
        getImages: (message: Message) => {
            const media: URL[] = [];
            if (message.attachments) {
                for (const attachment of message.attachments) {
                    if (
                        attachment.content_type?.startsWith('image/') ||
                        attachment.content_type?.startsWith('video/')
                    ) {
                        media.push(attachment.url as URL);
                    }
                }
            }
            if (message.embeds) {
                for (const embed of message.embeds) {
                    if (embed.image) {
                        media.push(embed.image.url as URL);
                    }
                    if (embed.video) {
                        media.push(embed.video.url as URL);
                    }
                }
            }
            // remove duplicates
            return [...new Set(media)];
        },
        getMedia: (message: Message): MediaResult => {
            const media: MediaResult = {
                images: [],
                videos: [],
            };
            if (message.attachments) {
                for (const attachment of message.attachments) {
                    if (attachment.content_type?.startsWith('image/')) {
                        media.images.push(attachment.url as URL);
                    } else if (attachment.content_type?.startsWith('video/')) {
                        media.videos.push(attachment.url as URL);
                    }
                }
            }
            if (message.embeds) {
                for (const embed of message.embeds) {
                    if (embed.image) {
                        media.images.push(embed.image.url as URL);
                    }
                    if (embed.video) {
                        media.videos.push(embed.video.url as URL);
                    }
                }
            }
            // remove duplicates
            return media;
        },
    };
}
