export function f(arg: E): void;
export type T = number;
export interface I {
    prop: string;
    method(arg: any): Promise<boolean>;
}
export class C implements I {
    constructor(arg1: T, arg2: string);
    private privateProp: boolean;
    prop: string;
    method(arg: any): Promise<boolean>;
}
export enum E {
    e1 = 0,
    e2 = 1,
    e3 = 2
}
