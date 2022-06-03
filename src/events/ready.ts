import { EventHandler } from "../data/types";
import { LowercaseEventName, ReadyData } from "../data/gatewayTypes";
import { ACTIVITY_TYPES, CLIENT_STATE } from "../data/numberTypes";
import Bot from "../structures/bot";
import { basename } from "path";

export default class ReadyHandler extends EventHandler {
    constructor(bot: Bot) {
        const filename = basename(__filename, '.js');
        super(filename as LowercaseEventName, bot);
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

    handler = (eventData: ReadyData) => {
        // TODO: initialize database, other setup stuff
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