import { Locale, Timestamp, TimestampFormat, UnixTimestampMillis } from '../types/types.js';
import { LangKey } from '../text/languageList.js';
import LangUtils from './language.js';
import TextUtils from './text.js';
import { DURATION_REGEX } from '../data/constants.js';

export const DURATION_UNITS = {
    SECOND: 1000,
    MINUTE: 1000 * 60,
    HOUR:   1000 * 60 * 60,
    DAY:    1000 * 60 * 60 * 24,
    WEEK:   1000 * 60 * 60 * 24 * 7,
    MONTH:  1000 * 60 * 60 * 24 * 30,
    YEAR:   1000 * 60 * 60 * 24 * 365
}
type UnitName = keyof typeof DURATION_UNITS;

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
        let unit = 1, unitName: UnitName = 'SECOND';
        if (duration >= DURATION_UNITS.YEAR) {
            unit = DURATION_UNITS.YEAR;
            unitName = 'YEAR';
        } else if (duration >= DURATION_UNITS.MONTH) {
            unit = DURATION_UNITS.MONTH;
            unitName = 'MONTH';
        } else if (duration >= DURATION_UNITS.WEEK) {
            unit = DURATION_UNITS.WEEK;
            unitName = 'WEEK';
        } else if (duration >= DURATION_UNITS.DAY) {
            unit = DURATION_UNITS.DAY;
            unitName = 'DAY';
        } else if (duration >= DURATION_UNITS.HOUR) {
            unit = DURATION_UNITS.HOUR;
            unitName = 'HOUR';
        } else if (duration >= DURATION_UNITS.MINUTE) {
            unit = DURATION_UNITS.MINUTE;
            unitName = 'MINUTE';
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

    static parseFloatLocale(localizedNumber: string, locale?: Locale) {
        // if number is an integer or no locale is provided, use default parse
        if (!locale || (!localizedNumber.includes(',') && !localizedNumber.includes('.'))) {
            return parseFloat(localizedNumber);
        }
        // test decimal conventions (, vs .) using Number.toLocaleString()
        // method adapted from https://stackoverflow.com/a/59679285
        const testNum = (1234.5).toLocaleString(locale);
        if (testNum.indexOf('.') > testNum.indexOf(',')) {
            // reverse decimal and thousands separators
            localizedNumber = Array.from(localizedNumber, char => {
                if (char === ',') {
                    return '.';
                }
                if (char === '.') {
                    return ','
                }
                return char;
            }).join('');
        }
        return parseFloat(localizedNumber);
    }

    static parseDuration(time: string): number | null {
		if (!DURATION_REGEX.test(time)) {
            return null;
        }

		let duration = 0;
        const matches = time.matchAll(DURATION_REGEX);
        for (const match of matches) {
            // match[0] = full string, match[1] = value, match[2] = unit
            const value = this.parseFloatLocale(match[1]);
            if (isNaN(value) || value <= 0) {
                continue;
            }
            const unit = match[2];
            if (unit.startsWith('y')) {
                duration += value * DURATION_UNITS.YEAR;
            } else if (unit.startsWith('mo')) {
                duration += value * DURATION_UNITS.MONTH;
            } else if (unit.startsWith('w')) {
                duration += value * DURATION_UNITS.WEEK;
            } else if (unit.startsWith('d')) {
                duration += value * DURATION_UNITS.DAY;
            } else if (unit.startsWith('h')) {
                duration += value * DURATION_UNITS.HOUR;
            } else if (unit.startsWith('m')) {
                duration += value * DURATION_UNITS.MINUTE;
            } else if (unit.startsWith('s')) {
                duration += value * DURATION_UNITS.SECOND;
            }
        }
        return duration;
		
	}
}