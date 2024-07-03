import * as os from 'os';
import type { GatewayParams, IdentifyData } from '../types/gatewayTypes.js';
import { ACTIVITY_TYPES, DURATION_UNITS, GATEWAY_VERSIONS, INTENT_FLAGS } from '../types/numberTypes.js';
import type { Snowflake } from '../types/types.js';

function getOSType() {
    const type = os.type();
    switch (type) {
        case 'Darwin':
            return 'macOS';
        case 'Windows_NT':
            return 'Windows';
        default:
            return type;
    }
}

/***** bot options *****/

export const DEFAULT_LANGUAGE = 'en-US';

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

export const GITHUB_LINK = 'https://github.com/bender-devs/Bender-v4';

export const DEFAULT_COLOR = 0xcc1616;

export const PUBLIC_KEY = ''; // TODO: fill this in

export const BOT_ACTIVITY_NAME = '❓ /help │ 🌐 benderbot.co';

/***** shard options *****/

export const SHARDED = true;
export const SHARD_COUNT = 1;
export const SHARD_SPAWN_COMMAND = 'node';
export const SHARD_SPAWN_FILE = './main.js';

export const SHARD_MESSAGE_TIMEOUT = DURATION_UNITS.SECOND * 10;

export const RESPAWN_DEAD_SHARDS = true;
export const EXIT_CODE_RESTART = 1;
export const EXIT_CODE_NO_RESTART = 69;

/***** connection info *****/

/** whether to retry when failing to connect to gateway */
export const GATEWAY_ERROR_RECONNECT = true;
/** how long to wait before reconnecting */
export const GATEWAY_ERROR_RECONNECT_TIMEOUT = DURATION_UNITS.SECOND * 30;

export const GATEWAY_PARAMS: GatewayParams = {
    v: GATEWAY_VERSIONS.CURRENT,
    encoding: 'json',
    compress: 'zlib-stream',
};

export const HEARTBEAT_TIMEOUT = DURATION_UNITS.SECOND * 15;

export const INTENTS =
    INTENT_FLAGS.GUILDS |
    INTENT_FLAGS.GUILD_MEMBERS |
    INTENT_FLAGS.GUILD_MODERATION |
    INTENT_FLAGS.GUILD_EMOJIS_AND_STICKERS |
    INTENT_FLAGS.GUILD_WEBHOOKS |
    INTENT_FLAGS.GUILD_PRESENCES |
    INTENT_FLAGS.GUILD_MESSAGES |
    INTENT_FLAGS.GUILD_MESSAGE_REACTIONS |
    INTENT_FLAGS.DIRECT_MESSAGES;

export const CONNECT_DATA: IdentifyData = {
    token: '', // assigned later
    properties: {
        os: getOSType(),
        browser: `Custom (${WEBSITE})`,
        device: `Custom (${WEBSITE})`,
    },
    presence: {
        since: null,
        afk: false,
        status: 'dnd',
        activities: [
            {
                name: 'Starting up...',
                type: ACTIVITY_TYPES.PLAYING,
                created_at: 0,
            },
        ],
    },
    intents: INTENTS,
};

/***** discord constants *****/

export const DISCORD_DOMAIN = 'https://discord.com';

export const API_BASE = `${DISCORD_DOMAIN}/api/v10`;

export const DISCORD_EPOCH = 1420070400000;

export const USER_AGENT = `DiscordBot (${WEBSITE}, ${VERSION}) [Custom library]`;

export const CDN_BASE = 'https://cdn.discordapp.com/';

/** retry rate limited request only when wait time is at or below this number */
export const MAX_RATE_LIMIT_DELAY = DURATION_UNITS.SECOND * 2;

/** timeframe in which editing interactions is allowed */
export const INTERACTION_RESPONSE_TIMEOUT = DURATION_UNITS.MINUTE * 15;

/***** database constants *****/

export const DB_WATCHER_OPTIONS = { maxAwaitTimeMS: DURATION_UNITS.SECOND * 5, batchSize: 69 };

export const DB_RECONNECT_DELAY = DURATION_UNITS.SECOND;

/***** webserver constants *****/

export const WEBSERVER_PORT = 9001;

/***** miscellaneous constants *****/

export const ID_REGEX = /\b\d{17,19}\b/;
export const ID_REGEX_EXACT = /^\d{17,19}$/;

export const INVITE_LINK_PREFIX = 'https://discord.gg/';
export const INVITE_CODE_REGEX = /^[a-z0-9-]{2,32}$/i;
export const INVITE_REGEX = /discord(?:\.gg(?:\/invite)?|(?:app)?\.com\/invite)\/([a-z0-9-]{2,32})/i;
export const INVITE_REGEX_EXACT =
    /^(?:https?:\/\/)?discord(?:\.gg(?:\/invite)?|(?:app)?\.com\/invite)\/([a-z0-9-]{2,32})$/i;
export const INVITE_REGEX_GLOBAL = /discord(?:\.gg(?:\/invite)?|(?:app)?\.com\/invite)\/([a-z0-9-]{2,32})/gi;

export const DURATION_REGEX =
    /([\d,.]+)\s*(s|secs?|seconds?|m|mins?|minutes?|h|hrs?|hours?|d|days?|w|wks?|weeks?|mos?|months?|y|yrs?|years?)/g;

export const EXAMPLE_TIMESTAMP = 3133702800000;
export const EXAMPLE_DURATION = DURATION_UNITS.YEAR * 69;

export const HEX_COLOR_REGEX = /^#?[0-9a-f]{6}$/i;
export const COLOR_NAMES_LINK = 'https://www.w3schools.com/colors/colors_names.asp';
