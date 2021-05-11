// @ts-nocheck

declare namespace Applitools {
  namespace WebdriverIO {
    type Browser = globalThis.WebdriverIO.Browser
    type Element = globalThis.WebdriverIO.Element
    type Selector = string | ((element: HTMLElement) => HTMLElement) | ((element: HTMLElement) => HTMLElement[])
  }
}