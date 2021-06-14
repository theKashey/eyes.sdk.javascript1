import type * as custom from './custom'
import type * as webdriver from './webdriver'

export type Driver = custom.Driver | webdriver.Driver
export type Context = custom.Context | webdriver.Driver
export type Element = custom.Element | webdriver.Element
export type Selector = custom.Selector | webdriver.Selector

export {makeSpec} from './custom'
export * as webdriverSpec from './webdriver'
