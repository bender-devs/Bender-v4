import { EventHandler } from '../types/types.js';
import { ReadyData } from '../types/gatewayTypes.js';
import { ACTIVITY_TYPES, CLIENT_STATE } from '../types/numberTypes.js';
import Bot from '../structures/bot.js';
import { BOT_ACTIVITY_NAME, VERSION } from '../data/constants.js';
import DiscordUtils from '../utils/discord.js';

export default class ReadyHandler extends EventHandler<ReadyData> {
    requiresReady = false;

    constructor(bot: Bot) {
        super('ready', bot);
    }

    cacheHandler = (eventData: ReadyData) => {
        this.bot.state = CLIENT_STATE.ALIVE;

        this.bot.gateway.version = eventData.v;
        this.bot.user = eventData.user;
        this.bot.cache.unavailableGuilds = eventData.guilds.map(g => g.id);
        this.bot.gateway.sessionID = eventData.session_id;
        if (eventData.shard && this.bot.shard) {
            this.bot.shard.setShardData(eventData.shard);
        }
        this.bot.application = eventData.application;
    }

    handler = (/*eventData: ReadyData*/) => {
        const userTag = DiscordUtils.user.getTag(this.bot.user);
        this.bot.logger.moduleLog('LOGGED IN', `\nLocked and loaded. Time to kill all humans?\n[${userTag} | v${VERSION} | mode: ${process.env.RUNTIME_MODE}]\n`);

        if (!this.bot.shard || this.bot.shard.id === 0) {
            this.bot.commandManager.updateGlobalAndDevCommands();
        }

        this.bot.gateway.updatePresence({
            since: Date.now(),
            status: 'online',
            afk: false,
            activities: [{
                name: BOT_ACTIVITY_NAME,
                state: BOT_ACTIVITY_NAME,
                type: ACTIVITY_TYPES.CUSTOM,
                created_at: Date.now()
            }]
        });
    }
}