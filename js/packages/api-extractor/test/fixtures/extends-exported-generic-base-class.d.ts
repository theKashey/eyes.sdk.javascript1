export class C1<T, U = bigint> {
    constructor(arg: T);
    constructor(arg: U);
    prop1: T | U;
    method1(arg: T): void;
    method1(arg: U): void;
}
export class C2 extends C1<boolean, bigint> {
    constructor(arg: number);
    prop2: number;
    method2(): void;
}
