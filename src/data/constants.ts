import { GatewayParams, IdentifyData } from "./gatewayTypes";
import { GATEWAY_VERSIONS } from "./numberTypes";
import { ACTIVITY_TYPES, INTENT_FLAGS } from './numberTypes';
import MiscUtils from "../utils/misc";
import { Snowflake } from "./types";

/***** bot options *****/

export const DEBUG = true;

export const USE_CACHE = true;

export const GATEWAY_ERROR_RECONNECT = true; // whether to retry when failing to connect to gateway

export const GATEWAY_ERROR_RECONNECT_TIMEOUT = 30000; // how many ms to wait when failing to connect to gateway

export const GATEWAY_PARAMS: GatewayParams = {
    v: GATEWAY_VERSIONS.CURRENT,
    encoding: 'json',
    compress: 'zlib-stream'
}

export const HEARTBEAT_TIMEOUT = 15000;

/***** bender constants *****/

export const VERSION = '4.0.0';

export const DOMAIN = 'benderbot.co';
export const WEBSITE = `https://${DOMAIN}`;
export const DASHBOARD = `https://dashboard.${DOMAIN}`;

export const OWNERS: Snowflake[] = ['246107833295175681'];

export const PUBLIC_KEY = ''; // TODO: fill this in

export const SHARDED = true;
export const SHARD_COUNT = 1;
export const SHARD_SPAWN_COMMAND = 'node';
export const SHARD_SPAWN_FILE = './main.js';
export const RESPAWN_DEAD_SHARDS = true;

export const INTENTS = INTENT_FLAGS.GUILDS & INTENT_FLAGS.GUILD_MEMBERS & INTENT_FLAGS.GUILD_BANS & INTENT_FLAGS.GUILD_EMOJIS_AND_STICKERS & INTENT_FLAGS.GUILD_WEBHOOKS & INTENT_FLAGS.GUILD_PRESENCES & INTENT_FLAGS.GUILD_MESSAGES & INTENT_FLAGS.GUILD_MESSAGE_REACTIONS & INTENT_FLAGS.DIRECT_MESSAGES;

export const CONNECT_DATA: IdentifyData = {
    token: '', // assigned later
    properties: {
        $os: MiscUtils.getOSType(),
        $browser: 'Custom (https://benderbot.co)',
        $device: 'Custom (https://benderbot.co)'
    },
    presence: {
        since: null,
        afk: false,
        status: 'dnd',
        activities: [{
            name: 'Starting up...',
            type: ACTIVITY_TYPES.PLAYING,
            created_at: 0
        }]
    },
    intents: INTENTS
};

export const AUTO_RESTART = true;
export const EXIT_CODE_RESTART = 1;
export const EXIT_CODE_NO_RESTART = 69;

/***** discord constants *****/

export const API_BASE = 'https://discord.com/api/v9';

export const DISCORD_EPOCH = 1420070400000;

export const USER_AGENT = `DiscordBot (${WEBSITE}, ${VERSION}) [Custom library]`;

export const CDN_BASE = 'https://cdn.discordapp.com/';

export const MAX_RATE_LIMIT_DELAY = 2000; // retry rate limited request only when wait time is at or below this number

/***** redis constants *****/

export const REDIS_HOST = '10.10.20.2';

export const REDIS_PORT = 6379;

export const REDIS_USER = 'default';

// REDIS_PASS defined in .env file

/***** webserver constants *****/

export const WEBSERVER_PORT = 9001;

/***** miscellaneous constants *****/

export const ID_REGEX = /\b\d{17,19}\b/;

export const ID_REGEX_EXACT = /^\d{17,19}$/;