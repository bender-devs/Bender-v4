import { Timestamp, UnixTimestamp } from "../data/types";

export default class TimeUtils {
    static parseTimestampMillis(timestamp: Timestamp): UnixTimestamp {
        return Date.parse(timestamp);
    }
}