import * as types from '@applitools/types'
import {MockDriver} from './mock-driver'

export type Driver = MockDriver
export type Context = MockDriver
export type Element = any
export type Selector = string | {using: string; value: string}

export type FakeSpecDriver = types.SpecDriver<Driver, Context, Element, Selector>

export const spec: FakeSpecDriver
