// @ts-nocheck

declare namespace Applitools {
  namespace WebdriverIO {
    interface Browser extends globalThis.WebdriverIO.BrowserObject {
      isDevTools: boolean
      getPuppeteer(): any
      getUrl(): string
      getTitle(): string
      getOrientation(): string
      getWindowRect(): {x: number; y: number; width: number; height: number}
      getWindowPosition(): {x: number; y: number}
      setWindowRect(x: number, y: number, width: number, height: number): void
      setWindowPosition(x: number, y: number): void
      switchToFrame(frameId?: any): void
      switchToParentFrame(): void
      takeScreenshot(): string
    }
    interface Element extends globalThis.WebdriverIO.Element {}
    type Selector = string | ((element: HTMLElement) => HTMLElement) | ((element: HTMLElement) => HTMLElement[])
  }
}