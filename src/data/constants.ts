import { GatewayParams, IdentifyData } from '../types/gatewayTypes';
import { GATEWAY_VERSIONS } from '../types/numberTypes';
import { ACTIVITY_TYPES, INTENT_FLAGS } from '../types/numberTypes';
import MiscUtils from '../utils/misc';
import { Snowflake } from '../types/types';

/***** bot options *****/

export const DEFAULT_LANGUAGE = 'en-US'; // this does not change default subcommand names due to additional code complexity

export const DEBUG = true;

export const USE_CACHE = true;

export const OWNERS: Snowflake[] = ['246107833295175681', '391743942070370304', '735199620803854428'];
export const DEV_SERVER: Snowflake = '548170772456275970';

/***** bender constants *****/

export const VERSION = '4.0.0';

export const DOMAIN = 'benderbot.co';
export const WEBSITE = `https://${DOMAIN}`;
export const DASHBOARD = `https://dashboard.${DOMAIN}`;

export const SUPPORT_SERVER = 'https://discord.gg/99xaeGn';

export const DEFAULT_COLOR = 0xFFFFFF;

export const PUBLIC_KEY = ''; // TODO: fill this in

/***** shard options *****/

export const SHARDED = true;
export const SHARD_COUNT = 1;
export const SHARD_SPAWN_COMMAND = 'node';
export const SHARD_SPAWN_FILE = './main.js';

export const SHARD_MESSAGE_TIMEOUT = 10000;

export const RESPAWN_DEAD_SHARDS = true;
export const EXIT_CODE_RESTART = 1;
export const EXIT_CODE_NO_RESTART = 69;

/***** connection info *****/

export const GATEWAY_ERROR_RECONNECT = true; // whether to retry when failing to connect to gateway

export const GATEWAY_ERROR_RECONNECT_TIMEOUT = 30000; // how many ms to wait when failing to connect to gateway

export const GATEWAY_PARAMS: GatewayParams = {
    v: GATEWAY_VERSIONS.CURRENT,
    encoding: 'json',
    compress: 'zlib-stream'
}

export const HEARTBEAT_TIMEOUT = 15000;

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

/***** discord constants *****/

export const API_BASE = 'https://discord.com/api/v10';

export const DISCORD_EPOCH = 1420070400000;

export const USER_AGENT = `DiscordBot (${WEBSITE}, ${VERSION}) [Custom library]`;

export const CDN_BASE = 'https://cdn.discordapp.com/';

export const MAX_RATE_LIMIT_DELAY = 2000; // retry rate limited request only when wait time is at or below this number

/***** webserver constants *****/

export const WEBSERVER_PORT = 9001;

/***** miscellaneous constants *****/

export const ID_REGEX = /\b\d{17,19}\b/;

export const ID_REGEX_EXACT = /^\d{17,19}$/;
