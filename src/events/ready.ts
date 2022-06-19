import { EventHandler } from '../types/types';
import { ReadyData, LowercaseEventName } from '../types/gatewayTypes';
import { ACTIVITY_TYPES, CLIENT_STATE } from '../types/numberTypes';
import Bot from '../structures/bot';
import { basename } from 'path';
import { VERSION } from '../data/constants';
import DiscordUtils from '../utils/discord';

export default class ReadyHandler extends EventHandler<ReadyData> {
    requiresReady = false;

    constructor(bot: Bot) {
        super(basename(__filename, '.js') as LowercaseEventName, bot);
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

        // TODO: use database to determine whether to update commands
        if (!this.bot.shard || this.bot.shard.id === 0) {
            this.bot.commandManager.updateCommandList();
        }

        this.bot.gateway.updatePresence({
            since: Date.now(),
            status: 'online',
            afk: false,
            activities: [{
                name: '/help | benderbot.co',
                type: ACTIVITY_TYPES.WATCHING,
                created_at: Date.now()
            }]
        });
    }
}