import StarboardUtils from '../eventUtils/starboard.js';
import type Bot from '../structures/bot.js';
import type { ProjectionObject } from '../types/dbTypes.js';
import type { ReactionAddData } from '../types/gatewayTypes.js';
import { EventHandler } from '../types/types.js';

export default class ReactionAddHandler extends EventHandler<ReactionAddData> {
    constructor(bot: Bot) {
        super('message_reaction_add', bot);
    }

    handler = async (eventData: ReactionAddData) => {
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

        this.bot.eventUtils.starboard.reactionAdd(eventData, guild, settings);

        // TODO: handle role menus & giveaways, if those aren't replaced with interactions
    };
}
