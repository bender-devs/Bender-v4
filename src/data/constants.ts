import { GatewayParams } from "./gatewayTypes";
import { GATEWAY_VERSIONS } from "./numberTypes";


export const API_BASE = "https://discord.com/api/v9";

export const GATEWAY_ERROR_RECONNECT_TIMEOUT = 30000; // how many ms to wait when failing to connect to gateway

export const GATEWAY_PARAMS: GatewayParams = {
    v: GATEWAY_VERSIONS.CURRENT,
    encoding: 'json'
}

export const DEBUG = true;