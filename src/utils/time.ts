import { Timestamp, UnixTimestampMillis } from '../data/types';

export default class TimeUtils {
    static parseTimestampMillis(timestamp: Timestamp): UnixTimestampMillis {
        return Date.parse(timestamp);
    }

    // TODO: add other time functions as needed
}