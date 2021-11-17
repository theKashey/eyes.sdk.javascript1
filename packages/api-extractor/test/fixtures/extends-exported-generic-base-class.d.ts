export class C1<T> {
    constructor(arg: T);
    prop1: T;
    method1(arg: T): void;
}
export class C2 extends C1<boolean> {
    constructor(arg: number);
    prop2: number;
    method2(): void;
}
