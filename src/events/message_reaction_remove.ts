import StarboardUtils from '../eventUtils/starboard.js';
import type Bot from '../structures/bot.js';
import type { ProjectionObject } from '../types/dbTypes.js';
import type { ReactionRemoveData } from '../types/gatewayTypes.js';
import { EventHandler } from '../types/types.js';

export default class ReactionRemoveHandler extends EventHandler<ReactionRemoveData> {
    constructor(bot: Bot) {
        super('message_reaction_remove', bot);
    }

    handler = async (eventData: ReactionRemoveData) => {
        if (!eventData.guild_id) {
            return null; // starboard only works in guilds
        }

        const fields: ProjectionObject = {};
        for (const setting of StarboardUtils.SETTINGS.REACTION) {
            fields[setting] = 1;
        }
        const settings = await this.bot.db.guild.get(eventData.guild_id, fields);
        if (!settings) {
            return null;
        }

        const guild = await this.bot.api.guild.fetch(eventData.guild_id);
        if (!guild) {
            this.bot.logger.handleError(this.name, 'Not handlking event because guild fetch failed!');
            return null;
        }

        this.bot.eventUtils.starboard.reactionRemove(eventData, guild, settings);

        // TODO: handle role menu if applicable and it isn't replaced with interactions
    };
}
