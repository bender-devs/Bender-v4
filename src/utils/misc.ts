export default class MiscUtils {
    static parseQueryString(data: Record<string, string | number>) {
        let qs = '';
        for (const key in data) {
            qs += `${qs ? '&' : '?'}${key}=${encodeURIComponent(data[key])}`;
        }
        return qs;
    }
}