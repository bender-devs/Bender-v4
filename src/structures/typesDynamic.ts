enum TimestampEnum { }

export type Timestamp = string & TimestampEnum;

// modified from https://www.regextester.com/94925
const TimestampRegex = /^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(\\.[0-9]{3})?Z?$/;

export function isTimestamp(date: string): date is Timestamp {
    return TimestampRegex.test(date);
}