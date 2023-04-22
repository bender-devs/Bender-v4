import { API_ERRORS } from '../types/numberTypes.js';
import { HTTPMethod, ResponseError } from '../types/types.js';

type BaseError = {
    code: string;
    message: string;
}
export interface APISubError extends BaseError {
    key: string;
}
type WrappedErrors = {
    _errors: BaseError[]
}
type NestedError = { [key: string]: NestedError } | WrappedErrors;

export default class APIError extends Error {
    code: API_ERRORS;
    message: string;
    errors: APISubError[];
    status: number;
    method: HTTPMethod;
    path: string;

    constructor(code: API_ERRORS, message: string, status: number, method: HTTPMethod, path: string) {
        super(message);
        this.code = code;
        this.message = message;
        this.errors = [];
        this.status = status;
        this.method = method;
        this.path = path;
    }

    static parseError(responseError: ResponseError): APIError | null {
        const body = responseError.response?.body;
        const status = responseError.status;
        const httpError = responseError.response?.error;
        if (!httpError || !status || status < 400) {
            return null;
        }
        if (typeof body === 'object' && body.code && body.message) {
            const apiError = new APIError(body.code, body.message, status, httpError.method as HTTPMethod, httpError.path);
            if (body.errors) {
                apiError.errors = this.parseSubErrors(body.errors);
            }
            return apiError;
        }
        return null;
    }

    static parseSubErrors(errorObj: NestedError, currentKey?: string): APISubError[] {
        if (typeof errorObj !== 'object') {
            return [];
        }
        let subErrors: APISubError[] = [];
        if ('_errors' in errorObj) {
            const errors = errorObj._errors as BaseError[];
            for (const error of errors) {
                subErrors.push({
                    code: error.code,
                    message: error.message,
                    key: currentKey || ''
                });
            }
            return subErrors;
        } else {
            for (const key in errorObj) {
                const nextKey = currentKey ? `${currentKey}.${key}` : key;
                const moreErrors = APIError.parseSubErrors(errorObj[key], nextKey);
                subErrors = subErrors.concat(moreErrors);
            }
        }
        return subErrors;
    }
}