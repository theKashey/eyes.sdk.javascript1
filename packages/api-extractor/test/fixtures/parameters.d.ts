export function f<T>(arg1: any, arg2: T, arg3?: string, ...rest: Array<any>): void;
export type T = { new <U>(arg1: any, arg2: U, arg3?: string, ...rest: Array<any>): any; method<U>(arg1: any, arg2: U, arg3?: string, ...rest: Array<any>): void; };
export type TC<U> = new (arg1: any, arg2: U, arg3?: string, ...rest: Array<any>) => any;
export type TF<U> = (arg1: any, arg2: U, arg3?: string, ...rest: Array<any>) => void;
export class C<T> {
    constructor(arg1: any, arg2: T, arg3?: string, ...rest: Array<any>);
    method(arg1: any, arg2: T, arg3?: string, ...rest: Array<any>): void;
}
