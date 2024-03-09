import type Bot from '../structures/bot.js';
import type { GuildDotFormatKey } from '../types/dbTypes.js';
import type { ChannelUpdateData } from '../types/gatewayTypes.js';
import { CHANNEL_TYPES } from '../types/numberTypes.js';
import { EventHandler } from '../types/types.js';

export default class ChannelDeleteHandler extends EventHandler<ChannelUpdateData> {
    constructor(bot: Bot) {
        super('channel_delete', bot);
    }

    cacheHandler = (eventData: ChannelUpdateData) => {
        if (!eventData.guild_id) {
            if (eventData.type === CHANNEL_TYPES.DM && eventData.recipients?.[0].id) {
                this.bot.cache.dmChannels.delete(eventData.recipients[0].id);
            }
            return; // ignore group dm channels
        }
        this.bot.cache.channels.delete(eventData.guild_id, eventData.id);
    };

    handler = async (eventData: ChannelUpdateData) => {
        if (!eventData.guild_id) {
            return null;
        }
        // update settings if they have become invalid
        const settings = await this.bot.db.guild.get(eventData.guild_id, {
            'memberLog.channel': 1,
        });
        if (!settings) {
            return null;
        }
        const deleteKeys: GuildDotFormatKey[] = [];
        if (settings.memberLog?.channel === eventData.id) {
            deleteKeys.push('memberLog.channel');
        }
        if (deleteKeys.length) {
            return this.bot.db.guild.deleteValues(eventData.guild_id, deleteKeys).catch((err) => {
                this.bot.logger.handleError('CHANNEL_DELETE', err);
                return null;
            });
        }
    };
}
