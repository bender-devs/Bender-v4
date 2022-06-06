import { Timestamp, UnixTimestampMillis } from '../data/types';

export default class TimeUtils {
    static parseTimestampMillis(timestamp: Timestamp): UnixTimestampMillis {
        return Date.parse(timestamp);
    }

    static getElapsedMillis(timestampMs: UnixTimestampMillis) {
        return Date.now() - timestampMs;
    }

    // TODO: add other time functions as needed
}