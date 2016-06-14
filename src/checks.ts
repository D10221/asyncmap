

    export function isUndefined(x) {
        return 'undefined' == typeof x;
    }

    export function isEmpty(x: any): boolean {
        return isUndefined(x) || x == null
    }

    export function notEmpty(x: any) {
        return !isEmpty(x);
    }
    export function isFunction<T>(x): x is () => T {
        return 'function' == typeof (x);
    }

    export function isPromise(x:any): x is Promise<any> {
        return  "then" in x // poor man's "is it a promise?" test
    }
