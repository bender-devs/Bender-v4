import { DISCORD_EPOCH } from '../data/constants';
import { Snowflake, UnixTimestampMillis } from '../types/types';
import * as os from 'os';

export default class MiscUtils {
    static parseQueryString(data: Record<string, string | number>): string {
        let qs = '';
        for (const key in data) {
            qs += `${qs ? '&' : '?'}${key}=${encodeURIComponent(data[key])}`;
        }
        return qs;
    }

    static getOSType() {
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

    // https://discord.com/developers/docs/reference#snowflakes-snowflake-id-format-structure-left-to-right
    static snowflakeToTimestamp(id: Snowflake): UnixTimestampMillis {
        const idInt = BigInt(id);
        return Number(idInt >> BigInt(22)) + DISCORD_EPOCH;
    }

    // https://discord.com/developers/docs/reference#snowflake-ids-in-pagination-generating-a-snowflake-id-from-a-timestamp-example
    static timestampToSnowflake(timestamp: UnixTimestampMillis) {
        return (timestamp - DISCORD_EPOCH) << 22;
    }

    static truncate(text = '', length = 2000, suffix?: string, strict = false) {
		const len = strict ? text.length : Array.from(text).length;
        const suffixLength = (suffix?.length || 0) + 4;
		return len > length ? `${text.substring(0, length - suffixLength)}${suffix} ...` : text;
	}
}