// @ts-nocheck

declare namespace Applitools {
  namespace WebdriverIO {
    interface Browser extends globalThis.WebdriverIO.Browser {}
    interface Element extends globalThis.WebdriverIO.Element {}
    type Selector = string | ((element: HTMLElement) => HTMLElement) | ((element: HTMLElement) => HTMLElement[])
  }
}