import { Locale, Timestamp, TimestampFormat, UnixTimestampMillis } from '../types/types.js';
import { LangKey } from '../text/languageList.js';
import LangUtils from './language.js';
import TextUtils from './text.js';

const unitMap = {
    MILLISECOND: 1,
    SECOND: 1000,
    MINUTE: 1000 * 60,
    HOUR: 1000 * 60 * 60,
    DAY: 1000 * 60 * 60 * 24,
    WEEK: 1000 * 60 * 60 * 24 * 7,
    MONTH: 1000 * 60 * 60 * 24 * 30,
    YEAR: 1000 * 60 * 60 * 24 * 365.25
}
type UnitName = keyof typeof unitMap;

export default class TimeUtils {
    static parseTimestampMillis(timestamp: Timestamp): UnixTimestampMillis {
        return Date.parse(timestamp);
    }

    static sinceTimestamp(timestamp: Timestamp) {
        const timestampMs = TimeUtils.parseTimestampMillis(timestamp);
        return Date.now() - timestampMs;
    }

    static sinceMillis(timestampMs: UnixTimestampMillis) {
        return Date.now() - timestampMs;
    }

    static untilTimestamp(timestamp: Timestamp) {
        const timestampMs = TimeUtils.parseTimestampMillis(timestamp);
        return timestampMs - Date.now();
    }

    static untilMillis(timestampMs: UnixTimestampMillis) {
        return timestampMs - Date.now();
    }

    static formatDuration(duration: number, locale?: Locale) {
        let unit = 1, unitName: UnitName = 'MILLISECOND';
        if (duration >= unitMap.YEAR) {
            unit = unitMap.YEAR;
            unitName = 'YEAR';
        } else if (duration >= unitMap.MONTH) {
            unit = unitMap.MONTH;
            unitName = 'MONTH';
        } else if (duration >= unitMap.WEEK) {
            unit = unitMap.WEEK;
            unitName = 'WEEK';
        } else if (duration >= unitMap.DAY) {
            unit = unitMap.DAY;
            unitName = 'DAY';
        } else if (duration >= unitMap.HOUR) {
            unit = unitMap.HOUR;
            unitName = 'HOUR';
        } else if (duration >= unitMap.MINUTE) {
            unit = unitMap.MINUTE;
            unitName = 'MINUTE';
        } else if (duration >= unitMap.SECOND) {
            unit = unitMap.SECOND;
            unitName = 'SECOND';
        }

        const number = Math.floor(duration / unit);
        const plural = number !== 1;

        const langKey: LangKey = `DURATION_${unitName}${plural ? 'S' : ''}`;
        if (!plural) {
            return LangUtils.get(langKey, locale);
        }
        return LangUtils.getAndReplace(langKey, { number }, locale);
    }

    static formatDate(date: Date | Timestamp | UnixTimestampMillis, format?: TimestampFormat) {
        // convert date or timestamp to unix timestamp
        if (typeof date === 'string') {
            date = TimeUtils.parseTimestampMillis(date);
        } else if (typeof date !== 'number') {
            date = date.getTime();
        }
        const timestamp: UnixTimestampMillis = Math.round(date); // should always be an int but just in case
        return TextUtils.timestamp.parse(timestamp, format);
    }

    static relative(date: Date | Timestamp | UnixTimestampMillis) {
        return this.formatDate(date, 'R')
    }

    // TODO: add other time functions as needed
}