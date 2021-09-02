import { GatewayParams } from "./gatewayTypes";
import { GATEWAY_VERSIONS } from "./numberTypes";

/***** bot options *****/

export const DEBUG = true;

export const USE_CACHE = true;

export const GATEWAY_ERROR_RECONNECT = true; // whether to retry when failing to connect to gateway

export const GATEWAY_ERROR_RECONNECT_TIMEOUT = 30000; // how many ms to wait when failing to connect to gateway

export const GATEWAY_PARAMS: GatewayParams = {
    v: GATEWAY_VERSIONS.CURRENT,
    encoding: 'json'
}

/***** general constants *****/

export const API_BASE = "https://discord.com/api/v9";

export const DISCORD_EPOCH = 1420070400000;