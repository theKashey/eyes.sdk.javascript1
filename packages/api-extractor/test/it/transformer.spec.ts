import * as assert from 'assert/strict'
import {compile} from '../utils/compile'
import {load} from '../utils/load'

describe('transformer', () => {
  it('works in the simplest scenario', () => {
    const output = compile({
      config: {rootFile: 'index.ts'},
      input: {
        'index.ts': `
        export type T = number
        export interface I {
          prop: string
          method(arg: any): Promise<boolean>
        }
        export class C implements I {
          private privateProp: boolean
          prop: string
          constructor(arg1: number, arg2: string) {}
          async method(arg: any): Promise<boolean> {
            return true
          }
        }
        export function f(arg: E): void {}
        export enum E {
          e1,
          e2,
          e3,
        }
        `,
      },
    })
    assert.equal(output, load('simple.d.ts'))
  })

  it('works with different kind of parameters', () => {
    const output = compile({
      config: {rootFile: 'index.ts'},
      input: {
        'index.ts': `
        export type T = {
          new <U>(arg1: any, arg2: U, arg3?: string, ...rest: any[]): any
          method<U>(arg1: any, arg2: U, arg3?: string, ...rest: any[]): void
        }

        export type TC<U> = new (arg1: any, arg2: U, arg3?: string, ...rest: any[]) => any
        export type TF<U> = (arg1: any, arg2: U, arg3?: string, ...rest: any[]) => void

        export class C<T> {
          constructor(arg1: any, arg2: T, arg3?: string, ...rest: any[]) {}
          method(arg1: any, arg2: T, arg3?: string, ...rest: any[]): void {}
        }
        export function f<T>(arg1: any, arg2: T, arg3?: string, ...rest: any[]): void {}
        `,
      },
    })
    assert.equal(output, load('parameters.d.ts'))
  })

  describe('works with default export', () => {
    it('class', () => {
      const output = compile({
        config: {rootFile: 'index.ts'},
        input: {
          'index.ts': `
          export default class C {}
          `,
        },
      })
      assert.equal(output, load('export-default-class.d.ts'))
    })

    it('named class', () => {
      const output = compile({
        config: {rootFile: 'index.ts'},
        input: {
          'index.ts': `
          export class C {}
          export default C
          `,
        },
      })
      assert.equal(output, load('export-default-exported-class.d.ts'))
    })

    it('interface', () => {
      const output = compile({
        config: {rootFile: 'index.ts'},
        input: {
          'index.ts': `
          export default interface I {}
          `,
        },
      })
      assert.equal(output, load('export-default-interface.d.ts'))
    })

    it('named interface', () => {
      const output = compile({
        config: {rootFile: 'index.ts'},
        input: {
          'index.ts': `
          export interface I {}
          export default I
          `,
        },
      })
      assert.equal(output, load('export-default-exported-interface.d.ts'))
    })

    it('function', () => {
      const output = compile({
        config: {rootFile: 'index.ts'},
        input: {
          'index.ts': `
          export default function f(arg: any): void {}
          `,
        },
      })
      assert.equal(output, load('export-default-function.d.ts'))
    })

    it('named function', () => {
      const output = compile({
        config: {rootFile: 'index.ts'},
        input: {
          'index.ts': `
          export function f(arg: any): void {}
          export default f
          `,
        },
      })
      assert.equal(output, load('export-default-exported-function.d.ts'))
    })

    it('value', () => {
      const output = compile({
        config: {rootFile: 'index.ts'},
        input: {
          'index.ts': `
          const value = 3 as number
          export default value
          `,
        },
      })
      assert.equal(output, load('export-default-value.d.ts'))
    })
  })

  describe('works with extended classes', () => {
    it('works with hidden base class', () => {
      const output = compile({
        config: {rootFile: 'index.ts'},
        input: {
          'index.ts': `
          class C1 {
            static prop1: boolean
            constructor(arg: boolean) {}
            prop1: boolean
            method1(): void {}
          }
          export class C2 extends C1 {
            static prop2: boolean
            constructor(arg: number) {
              super(Boolean(arg))
            }
            prop2: number
            method2(): void {}
          }
          `,
        },
      })
      assert.equal(output, load('extends-hidden-base-class.d.ts'))
    })

    it('works with hidden generic base class', () => {
      const output = compile({
        config: {rootFile: 'index.ts'},
        input: {
          'index.ts': `
          class C1<T> {
            constructor(arg: T) {}
            prop1: T
            method1(arg: T): void {}
          }
          export class C2 extends C1<boolean> {
            constructor(arg: number) {
              super(Boolean(arg))
            }
            prop2: number
            method2(): void {}
          }
          `,
        },
      })
      assert.equal(output, load('extends-hidden-generic-base-class.d.ts'))
    })

    it('works with exported base class', () => {
      const output = compile({
        config: {rootFile: 'index.ts'},
        input: {
          'index.ts': `
          export class C1 {
            static prop1: boolean
            constructor(arg: boolean) {}
            prop1: boolean
            method1(): void {}
          }
          export class C2 extends C1 {
            static prop2: boolean
            constructor(arg: number) {
              super(Boolean(arg))
            }
            prop2: number
            method2(): void {}
          }
          `,
        },
      })
      assert.equal(output, load('extends-exported-base-class.d.ts'))
    })

    it('works with exported generic base class', () => {
      const output = compile({
        config: {rootFile: 'index.ts'},
        input: {
          'index.ts': `
          export class C1<T> {
            constructor(arg: T) {}
            prop1: T
            method1(arg: T): void {}
          }
          export class C2 extends C1<boolean> {
            constructor(arg: number) {
              super(Boolean(arg))
            }
            prop2: number
            method2(): void {}
          }
          `,
        },
      })
      assert.equal(output, load('extends-exported-generic-base-class.d.ts'))
    })
  })
})
