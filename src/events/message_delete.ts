import StarboardUtils from '../eventUtils/starboard.js';
import type Bot from '../structures/bot.js';
import type { ProjectionObject } from '../types/dbTypes.js';
import type { MessageDeleteData } from '../types/gatewayTypes.js';
import { EventHandler } from '../types/types.js';

export default class MessageDeleteHandler extends EventHandler<MessageDeleteData> {
    constructor(bot: Bot) {
        super('message_delete', bot);
    }

    cacheHandler = (eventData: MessageDeleteData) => {
        if (eventData.guild_id) {
            this.bot.cache.messages.delete(eventData.guild_id, eventData.channel_id, eventData.id);
        } else {
            this.bot.cache.dmMessages.delete(eventData.channel_id, eventData.id);
        }
    };

    handler = async (eventData: MessageDeleteData) => {
        if (!eventData.guild_id) {
            return null; // no relevant features use this event outside of guilds
        }

        const starboardSettings = StarboardUtils.SETTINGS.MESSAGE_DELETE;
        const fields: ProjectionObject = {};
        for (const setting of starboardSettings) {
            fields[setting] = 1;
        }

        const settings = await this.bot.db.guild.get(eventData.guild_id, fields);
        if (!settings) {
            return null;
        }
        const guild = await this.bot.api.guild.fetch(eventData.guild_id);
        if (!guild) {
            this.bot.logger.handleError(this.name, 'Not handling event because guild fetch failed!');
            return null;
        }

        this.bot.eventUtils.starboard.messageDelete(eventData, guild, settings);

        // TODO: if delete logging is enabled, post to log channel
        /* TODO: if message is a giveaway, cancel the giveaway
         * (if giveaways aren't replaced with interactions)
         */
        /* TODO: if message is a role menu, delete it from the db
         * (if role menus aren't replaced with interactions)
         */
    };
}
