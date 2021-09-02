import { DISCORD_EPOCH } from "../data/constants";
import { Snowflake, UnixTimestamp } from "../data/types";

export default class MiscUtils {
    static parseQueryString(data: Record<string, string | number>): string {
        let qs = '';
        for (const key in data) {
            qs += `${qs ? '&' : '?'}${key}=${encodeURIComponent(data[key])}`;
        }
        return qs;
    }

    // https://discord.com/developers/docs/reference#snowflakes-snowflake-id-format-structure-left-to-right
    static snowflakeToTimestamp(id: Snowflake): UnixTimestamp {
        const idInt = BigInt(id);
        return Number(idInt >> BigInt(22)) + DISCORD_EPOCH;
    }
    
    // https://discord.com/developers/docs/reference#snowflake-ids-in-pagination-generating-a-snowflake-id-from-a-timestamp-example
    static timestampToSnowflake(timestamp: UnixTimestamp) {
        return (timestamp - DISCORD_EPOCH) << 22;
    }
}