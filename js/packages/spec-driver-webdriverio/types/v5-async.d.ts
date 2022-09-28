// @ts-nocheck

declare namespace Applitools {
  namespace WebdriverIO {
    interface Browser extends globalThis.WebdriverIOAsync.BrowserObject {
      isDevTools: boolean,
      getSession(): Promise<Record<string, any>>
      getPuppeteer(): Promise<any>
      getUrl(): Promise<string>
      getTitle(): Promise<string>
      getOrientation(): Promise<string>
      setOrientation(orientation: string): Promise<void>
      getSystemBars(): Promise<object[]>
      getContext(): Promise<string>
      getElementAttribute(elementId: string, attr: string): Promise<string>
      getWindowRect(): Promise<{x: number; y: number; width: number; height: number}>
      getWindowPosition(): Promise<{x: number; y: number}>
      _getWindowSize(): Promise<{width: number; height: number}>
      setWindowRect(x: number, y: number, width: number, height: number): Promise<void>
      setWindowPosition(x: number, y: number): Promise<void>
      _setWindowSize(width: number, height: number): Promise<void>
      switchToFrame(frameId?: any): Promise<void>
      switchToParentFrame(): Promise<void>
      takeScreenshot(): Promise<string>
      sendCommandAndGetResult(command: string, params: Record<string, any>): Promise<Record<string, any>>
      switchContext(id: string): Promise<void>
      getContexts(): Promise<string[]>
    }
    interface Element extends globalThis.WebdriverIOAsync.Element {}
    type Selector = string | ((element: HTMLElement) => HTMLElement) | ((element: HTMLElement) => HTMLElement[])
  }
}
