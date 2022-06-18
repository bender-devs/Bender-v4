import { Snowflake, URL } from '../types/types';
import { CDN_BASE } from '../data/constants';

export type ImageFormat = 'png' | 'jpg' | 'jpeg' | 'webp';

export type ImageFormatAnimated = ImageFormat | 'gif';

export type StickerFormat = 'png' | 'json'; // json = lottie

export type ImageSize = 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048 | 4096;

// https://discord.com/developers/docs/reference#image-formatting-cdn-endpoints
export default class CDNUtils {
    static #formatAndSize(format: ImageFormatAnimated | StickerFormat, size?: ImageSize) {
        return `.${format}${size ? `?size=${size}` : ''}`;
    }

    static #fixAnimatedFormat(format: ImageFormatAnimated, hash: string): ImageFormatAnimated {
        if (format !== 'gif' && hash.startsWith('a_')) {
            return 'gif';
        } else if (format === 'gif' && !hash.startsWith('a_')) {
            return 'png';
        }
        return format;
    }

    static #getGeneric(baseName: string, id: Snowflake, hash: string, format: ImageFormatAnimated = 'png', size?: ImageSize): URL {
        return `${CDN_BASE}${baseName}/${id}/${hash}${this.#formatAndSize(format, size)}`;
    }

    static emojiURL(emojiID: Snowflake, animated: boolean, format: ImageFormatAnimated = 'png', size?: ImageSize): URL {
        format = this.#fixAnimatedFormat(format, animated ? 'a_' : '');
        return `${CDN_BASE}emojis/${emojiID}${this.#formatAndSize(format, size)}`;
    }

    static guildIcon(guildID: Snowflake, iconHash: string, format: ImageFormatAnimated = 'png', size?: ImageSize): URL {
        format = this.#fixAnimatedFormat(format, iconHash);
        return this.#getGeneric('icons', guildID, iconHash, format, size);
    }

    static guildSplash(guildID: Snowflake, splashHash: string, format: ImageFormat = 'png', size?: ImageSize): URL {
        return this.#getGeneric('splashes', guildID, splashHash, format, size);
    }

    static guildDiscoverySplash(guildID: Snowflake, splashHash: string, format: ImageFormat = 'png', size?: ImageSize): URL {
        return this.#getGeneric('discovery-splashes', guildID, splashHash, format, size);
    }

    static guildBanner(guildID: Snowflake, bannerHash: string, format: ImageFormat = 'png', size?: ImageSize): URL {
        return this.#getGeneric('banners', guildID, bannerHash, format, size);
    }

    static userBanner(userID: Snowflake, bannerHash: string, format: ImageFormatAnimated = 'png', size?: ImageSize): URL {
        format = this.#fixAnimatedFormat(format, bannerHash);
        return this.#getGeneric('banners', userID, bannerHash, format, size);
    }

    static userDefaultAvatar(discriminator: number | `${number}`): URL {
        if (typeof discriminator === 'string') {
            discriminator = parseInt(discriminator);
        }
        return `${CDN_BASE}embed/avatars/${discriminator % 5}.png`;
    }

    static userAvatar(userID: Snowflake, avatarHash: string, format: ImageFormatAnimated = 'png', size?: ImageSize): URL {
        format = this.#fixAnimatedFormat(format, avatarHash);
        return this.#getGeneric('avatars', userID, avatarHash, format, size);
    }

    static applicationIcon(applicationID: Snowflake, iconHash: string, format: ImageFormat = 'png', size?: ImageSize): URL {
        return this.#getGeneric('app-icons', applicationID, iconHash, format, size);
    }

    static applicationCover(applicationID: Snowflake, coverHash: string, format: ImageFormat = 'png', size?: ImageSize): URL {
        return this.applicationIcon(applicationID, coverHash, format, size);
    }

    static applicationAsset(applicationID: Snowflake, assetID: string, format: ImageFormat = 'png', size?: ImageSize): URL {
        return this.#getGeneric('app-assets', applicationID, assetID, format, size);
    }

    static achievementIcon(applicationID: Snowflake, achievementID: string, iconHash: string, format: ImageFormat = 'png', size?: ImageSize): URL {
        return `${CDN_BASE}app-assets/${applicationID}/achievements/${achievementID}/icons/${iconHash}${this.#formatAndSize(format, size)}`;
    }

    static stickerPackBanner(bannerAssetID: Snowflake, format: ImageFormat = 'png', size?: ImageSize): URL {
        return `${CDN_BASE}app-assets/710982414301790216/store/${bannerAssetID}${this.#formatAndSize(format, size)}`;
    }

    static teamIcon(teamID: Snowflake, iconHash: string, format: ImageFormat = 'png', size?: ImageSize): URL {
        return this.#getGeneric('team-icons', teamID, iconHash, format, size);
    }

    static sticker(stickerID: Snowflake, format: StickerFormat): URL {
        return `${CDN_BASE}stickers/${stickerID}.${format}`;
    }
}