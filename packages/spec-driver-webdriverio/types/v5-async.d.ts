// @ts-nocheck

declare namespace Applitools {
  namespace WebdriverIO {
    interface Browser extends globalThis.WebdriverIOAsync.BrowserObject {
      isDevTools: boolean,
      getPuppeteer(): Promise<any>
      getUrl(): Promise<string>
      getTitle(): Promise<string>
      getOrientation(): Promise<string>
      getWindowRect(): Promise<{x: number; y: number; width: number; height: number}>
      getWindowPosition(): Promise<{x: number; y: number}>
      setWindowRect(x: number, y: number, width: number, height: number): Promise<void>
      setWindowPosition(x: number, y: number): Promise<void>
      switchToFrame(frameId?: any): Promise<void>
      switchToParentFrame(): Promise<void>
      takeScreenshot(): Promise<string>
    }
    interface Element extends globalThis.WebdriverIO.Element {}
    type Selector = string | ((element: HTMLElement) => HTMLElement) | ((element: HTMLElement) => HTMLElement[])
  }
}