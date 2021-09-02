import { API_ERRORS } from "../data/numberTypes";
import { ResponseError } from "../data/types";

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
type ObjectErrors = Record<string, WrappedErrors>;
type ArrayErrors = Record<`${number}`, ObjectErrors>;
type ErrorMap = Record<string, ArrayErrors | WrappedErrors>;

export default class APIError {
    code: API_ERRORS;
    message: string;
    errors: APISubError[];

    constructor(code: API_ERRORS, message: string) {
        this.code = code;
        this.message = message;
        this.errors = [];
    }

    static parseError(responseError: ResponseError): APIError | null {
        const body = responseError.response?.body;
        if (typeof body === 'object' && body.code && body.message) {
            const apiError = new APIError(body.code, body.message);
            if (body.errors) {
                apiError.errors = this.parseSubErrors(body.errors);
            }
            return apiError;
        }
        return null;
    }

    static parseSubErrors(errors: ErrorMap): APISubError[] {
        const subErrors: APISubError[] = [];
        for (const key in errors) {
            const errorsLevel1 = errors[key];
            if ('_errors' in errorsLevel1) {
                for (const error of errorsLevel1._errors) {
                    subErrors.push({
                        code: error.code,
                        message: error.message,
                        key
                    });
                }
            } else {
                let indexKey: `${number}`;
                for (indexKey in errorsLevel1) {
                    for (const subkey in errorsLevel1[indexKey]) {
                        const errorsLevel2 = errorsLevel1[indexKey][subkey];
                        for (const error of errorsLevel2._errors) {
                            subErrors.push({
                                code: error.code,
                                message: error.message,
                                key: `${key}.${indexKey}.${subkey}`
                            });
                        }
                    }
                }
            }
        }
        return subErrors;
    }
}