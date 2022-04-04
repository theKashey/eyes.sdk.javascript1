import type * as types from '@applitools/types'
import * as utils from '@applitools/utils'
import * as specUtils from './spec-utils'
import {Context, ContextReference} from './context'
import {Element} from './element'
import {HelperIOS} from './helper-ios'
import {HelperAndroid} from './helper-android'
import {parseUserAgent} from './user-agent'
import {parseCapabilities} from './capabilities'

const snippets = require('@applitools/snippets')

// eslint-disable-next-line
export class Driver<TDriver, TContext, TElement, TSelector> {
  private _target: TDriver

  private _mainContext: Context<TDriver, TContext, TElement, TSelector>
  private _currentContext: Context<TDriver, TContext, TElement, TSelector>
  private _driverInfo: types.DriverInfo
  private _logger: any
  private _helper?:
    | HelperAndroid<TDriver, TContext, TElement, TSelector>
    | HelperIOS<TDriver, TContext, TElement, TSelector>

  protected readonly _spec: types.SpecDriver<TDriver, TContext, TElement, TSelector>

  constructor(options: {
    spec: types.SpecDriver<TDriver, TContext, TElement, TSelector>
    driver: Driver<TDriver, TContext, TElement, TSelector> | TDriver
    logger?: any
  }) {
    if (options.driver instanceof Driver) return options.driver

    this._spec = options.spec

    if (options.logger) this._logger = options.logger

    if (this._spec.isDriver(options.driver)) {
      this._target = this._spec.transformDriver?.(options.driver) ?? options.driver
    } else {
      throw new TypeError('Driver constructor called with argument of unknown type!')
    }

    this._mainContext = new Context({
      spec: this._spec,
      context: this._spec.extractContext?.(this._target) ?? ((<unknown>this._target) as TContext),
      driver: this,
      logger: this._logger,
    })
    this._currentContext = this._mainContext
  }

  get target(): TDriver {
    return this._target
  }
  get currentContext(): Context<TDriver, TContext, TElement, TSelector> {
    return this._currentContext
  }
  get mainContext(): Context<TDriver, TContext, TElement, TSelector> {
    return this._mainContext
  }
  get helper() {
    return this._helper
  }
  get features() {
    return this._driverInfo?.features
  }
  get deviceName(): string {
    return this._driverInfo?.deviceName
  }
  get platformName(): string {
    return this._driverInfo?.platformName
  }
  get platformVersion(): string | number {
    return this._driverInfo?.platformVersion
  }
  get browserName(): string {
    return this._driverInfo?.browserName
  }
  get browserVersion(): string | number {
    return this._driverInfo?.browserVersion
  }
  get userAgent(): string {
    return this._driverInfo?.userAgent
  }
  get orientation(): 'portrait' | 'landscape' {
    return this._driverInfo.orientation
  }
  get pixelRatio(): number {
    return this._driverInfo.pixelRatio ?? 1
  }
  get viewportScale(): number {
    return this._driverInfo.viewportScale ?? 1
  }
  get statusBarHeight(): number {
    return this._driverInfo.statusBarHeight ?? (this.isNative ? 0 : undefined)
  }
  get navigationBarHeight(): number {
    return this._driverInfo.navigationBarHeight ?? (this.isNative ? 0 : undefined)
  }
  get isNative(): boolean {
    return this._driverInfo?.isNative ?? false
  }
  get isWeb(): boolean {
    return !this.isNative
  }
  get isMobile(): boolean {
    return this._driverInfo?.isMobile ?? false
  }
  get isIOS(): boolean {
    return this.platformName?.toLowerCase() === 'ios'
  }
  get isAndroid(): boolean {
    return this.platformName?.toLowerCase() === 'android'
  }
  get isIE(): boolean {
    return /(internet explorer|ie)/i.test(this.browserName)
  }
  get isEdgeLegacy(): boolean {
    return /edge/i.test(this.browserName) && Number(this.browserVersion) <= 44
  }

  updateCurrentContext(context: Context<TDriver, TContext, TElement, TSelector>): void {
    this._currentContext = context
  }

  async init(): Promise<this> {
    const capabilities = await this._spec.getCapabilities?.(this.target)

    this._logger.log('Driver capabilities', capabilities)

    const capabilitiesInfo = capabilities ? parseCapabilities(capabilities) : undefined
    const driverInfo = await this._spec.getDriverInfo?.(this.target)

    this._driverInfo = {...capabilitiesInfo, ...driverInfo}

    if (this.isWeb) {
      this._driverInfo.pixelRatio ??= await this.execute(snippets.getPixelRatio)
      this._driverInfo.viewportScale ??= await this.execute(snippets.getViewportScale)
      this._driverInfo.userAgent ??= await this.execute(snippets.getUserAgent)
      if (this._driverInfo.userAgent) {
        const userAgentInfo = parseUserAgent(this._driverInfo.userAgent)
        this._driverInfo.browserName = userAgentInfo.browserName ?? this._driverInfo.browserName
        this._driverInfo.browserVersion = userAgentInfo.browserVersion ?? this._driverInfo.browserVersion
        if (this._driverInfo.isMobile) {
          this._driverInfo.platformName ??= userAgentInfo.platformName
          this._driverInfo.platformVersion ??= userAgentInfo.platformVersion
        } else {
          this._driverInfo.platformName = userAgentInfo.platformName ?? this._driverInfo.platformName
          this._driverInfo.platformVersion = userAgentInfo.platformVersion ?? this._driverInfo.platformVersion
        }
      }

      this._driverInfo.features ??= {}
      this._driverInfo.features.allCookies ??=
        /chrome/i.test(this._driverInfo.browserName) && !this._driverInfo.isMobile
    } else {
      const barsHeight = await this._spec.getBarsHeight?.(this.target).catch(() => undefined as never)
      const displaySize = await this.getDisplaySize()

      // calculate status and navigation bars sizes
      if (barsHeight) {
        // when status bar is overlapping content on android it returns status bar height equal to viewport height
        if (this.isAndroid && barsHeight.statusBarHeight / this.pixelRatio < displaySize.height) {
          this._driverInfo.statusBarHeight = Math.max(this._driverInfo.statusBarHeight ?? 0, barsHeight.statusBarHeight)
        }
        this._driverInfo.navigationBarHeight = Math.max(
          this._driverInfo.navigationBarHeight ?? 0,
          barsHeight.navigationBarHeight,
        )
      }
      if (this.isAndroid) {
        this._driverInfo.statusBarHeight /= this.pixelRatio
        this._driverInfo.navigationBarHeight /= this.pixelRatio
      }

      // calculate viewport size
      if (!this._driverInfo.viewportSize) {
        this._driverInfo.viewportSize = {
          width: displaySize.width,
          height: displaySize.height - this._driverInfo.statusBarHeight,
        }
      }

      // calculate safe area
      if (this.isIOS && !this._driverInfo.safeArea) {
        this._driverInfo.safeArea = {x: 0, y: 0, ...displaySize}
        const topElement = await this.element({type: '-ios class chain', selector: '**/XCUIElementTypeNavigationBar'})
        if (topElement) {
          const topRegion = await this._spec.getElementRegion(this.target, topElement.target)
          const topOffset = topRegion.y + topRegion.height
          this._driverInfo.safeArea.y = topOffset
          this._driverInfo.safeArea.height -= topOffset
        }
        const bottomElement = await this.element({type: '-ios class chain', selector: '**/XCUIElementTypeTabBar'})
        if (bottomElement) {
          const bottomRegion = await this._spec.getElementRegion(this.target, bottomElement.target)
          const bottomOffset = bottomRegion.height
          this._driverInfo.safeArea.height -= bottomOffset
        }
      }

      // init helper lib
      this._helper = this.isIOS
        ? await HelperIOS.make({spec: this._spec, driver: this, logger: this._logger})
        : await HelperAndroid.make({spec: this._spec, driver: this, logger: this._logger})
    }

    if (this.isMobile) {
      this._driverInfo.orientation ??= await this.getOrientation().catch(() => undefined)
    }

    this._logger.log('Combined driver info', this._driverInfo)

    return this
  }

  async refreshContexts(): Promise<Context<TDriver, TContext, TElement, TSelector>> {
    if (this.isNative) return this.currentContext

    const spec = this._spec

    let currentContext = this.currentContext.target
    let contextInfo = await getContextInfo(currentContext)

    const path = []
    if (spec.parentContext) {
      while (!contextInfo.isRoot) {
        currentContext = await spec.parentContext(currentContext)
        const contextReference = await findContextReference(currentContext, contextInfo)
        if (!contextReference) throw new Error('Unable to find out the chain of frames')
        path.unshift(contextReference)
        contextInfo = await getContextInfo(currentContext)
      }
    } else {
      currentContext = await spec.mainContext(currentContext)
      path.push(...(await findContextPath(currentContext, contextInfo)))
    }
    this._currentContext = this._mainContext
    return this.switchToChildContext(...path)

    function transformSelector(selector: types.Selector<TSelector>) {
      return specUtils.transformSelector(spec, selector, {isWeb: true})
    }

    async function getContextInfo(context: TContext): Promise<any> {
      const [documentElement, selector, isRoot, isCORS] = await spec.executeScript(context, snippets.getContextInfo)
      return {documentElement, selector, isRoot, isCORS}
    }

    async function getChildContextsInfo(context: TContext): Promise<any[]> {
      const framesInfo = await spec.executeScript(context, snippets.getChildFramesInfo)
      return framesInfo.map(([contextElement, isCORS]: [TElement, boolean]) => ({contextElement, isCORS}))
    }

    async function isEqualElements(context: TContext, element1: TElement, element2: TElement): Promise<boolean> {
      return spec.executeScript(context, snippets.isEqualElements, [element1, element2]).catch(() => false)
    }

    async function findContextReference(context: TContext, contextInfo: any): Promise<TElement> {
      if (contextInfo.selector) {
        const contextElement = await spec.findElement(
          context,
          transformSelector({type: 'xpath', selector: contextInfo.selector}),
        )
        if (contextElement) return contextElement
      }

      for (const childContextInfo of await getChildContextsInfo(context)) {
        if (childContextInfo.isCORS !== contextInfo.isCORS) continue
        const childContext = await spec.childContext(context, childContextInfo.contextElement)
        const contentDocument = await spec.findElement(childContext, transformSelector('html'))
        const isWantedContext = await isEqualElements(childContext, contentDocument, contextInfo.documentElement)
        await spec.parentContext(childContext)
        if (isWantedContext) return childContextInfo.contextElement
      }
    }

    async function findContextPath(
      context: TContext,
      contextInfo: any,
      contextPath: TElement[] = [],
    ): Promise<TElement[]> {
      const contentDocument = await spec.findElement(context, transformSelector('html'))

      if (await isEqualElements(context, contentDocument, contextInfo.documentElement)) {
        return contextPath
      }

      for (const childContextInfo of await getChildContextsInfo(context)) {
        const childContext = await spec.childContext(context, childContextInfo.contextElement)
        const possibleContextPath = [...contextPath, childContextInfo.contextElement]
        const wantedContextPath = await findContextPath(childContext, contextInfo, possibleContextPath)
        await spec.mainContext(context)

        if (wantedContextPath) return wantedContextPath

        for (const contextElement of contextPath) {
          await spec.childContext(context, contextElement)
        }
      }
    }
  }

  async switchTo(
    context: Context<TDriver, TContext, TElement, TSelector>,
  ): Promise<Context<TDriver, TContext, TElement, TSelector>> {
    if (await this.currentContext.equals(context)) {
      this._currentContext = context
      return
    }
    const currentPath = this.currentContext.path
    const requiredPath = context.path

    let diffIndex = -1
    for (const [index, context] of requiredPath.entries()) {
      if (currentPath[index] && !(await currentPath[index].equals(context))) {
        diffIndex = index
        break
      }
    }

    if (diffIndex === 0) {
      throw new Error('Cannot switch to the context, because it has different main context')
    } else if (diffIndex === -1) {
      if (currentPath.length === requiredPath.length) {
        // required and current paths are the same
        return this.currentContext
      } else if (requiredPath.length > currentPath.length) {
        // current path is a sub-path of required path
        return this.switchToChildContext(...requiredPath.slice(currentPath.length))
      } else if (currentPath.length - requiredPath.length <= requiredPath.length) {
        // required path is a sub-path of current path
        return this.switchToParentContext(currentPath.length - requiredPath.length)
      } else {
        // required path is a sub-path of current path
        await this.switchToMainContext()
        return this.switchToChildContext(...requiredPath)
      }
    } else if (currentPath.length - diffIndex <= diffIndex) {
      // required path is different from current or they are partially intersected
      // chose an optimal way to traverse from current context to target context
      await this.switchToParentContext(currentPath.length - diffIndex)
      return this.switchToChildContext(...requiredPath.slice(diffIndex))
    } else {
      await this.switchToMainContext()
      return this.switchToChildContext(...requiredPath)
    }
  }

  async switchToMainContext(): Promise<Context<TDriver, TContext, TElement, TSelector>> {
    if (this.isNative) throw new Error('Contexts are supported only for web drivers')

    this._logger.log('Switching to the main context')
    await this._spec.mainContext(this.currentContext.target)
    return (this._currentContext = this._mainContext)
  }

  async switchToParentContext(elevation = 1): Promise<Context<TDriver, TContext, TElement, TSelector>> {
    if (this.isNative) throw new Error('Contexts are supported only for web drivers')

    this._logger.log('Switching to a parent context with elevation:', elevation)
    if (this.currentContext.path.length <= elevation) {
      return this.switchToMainContext()
    }

    try {
      while (elevation > 0) {
        await this._spec.parentContext(this.currentContext.target)
        this._currentContext = this._currentContext.parent
        elevation -= 1
      }
    } catch (err) {
      this._logger.warn('Unable to switch to a parent context due to error', err)
      this._logger.log('Applying workaround to switch to the parent frame')
      const path = this.currentContext.path.slice(1, -elevation)
      await this.switchToMainContext()
      await this.switchToChildContext(...path)
      elevation = 0
    }
    return this.currentContext
  }

  async switchToChildContext(
    ...references: ContextReference<TDriver, TContext, TElement, TSelector>[]
  ): Promise<Context<TDriver, TContext, TElement, TSelector>> {
    if (this.isNative) throw new Error('Contexts are supported only for web drivers')
    this._logger.log('Switching to a child context with depth:', references.length)
    for (const reference of references) {
      if (reference === this.mainContext) continue
      const context = await this.currentContext.context(reference)
      await context.focus()
    }
    return this.currentContext
  }

  async normalizeRegion(region: types.Region): Promise<types.Region> {
    if (this.isWeb || !utils.types.has(this._driverInfo, ['viewportSize', 'statusBarHeight'])) return region
    const scaledRegion = this.isAndroid ? utils.geometry.scale(region, 1 / this.pixelRatio) : region
    const safeRegion = this.isIOS ? utils.geometry.intersect(scaledRegion, this._driverInfo.safeArea) : scaledRegion
    const offsetRegion = utils.geometry.offsetNegative(safeRegion, {x: 0, y: this.statusBarHeight})
    if (offsetRegion.y < 0) {
      offsetRegion.height += offsetRegion.y
      offsetRegion.y = 0
    }
    return offsetRegion
  }

  async getRegionInViewport(
    context: Context<TDriver, TContext, TElement, TSelector>,
    region: types.Region,
  ): Promise<types.Region> {
    await context.focus()
    return context.getRegionInViewport(region)
  }

  async element(selector: types.Selector<TSelector>): Promise<Element<TDriver, TContext, TElement, TSelector>> {
    return this.currentContext.element(selector)
  }

  async elements(selector: types.Selector<TSelector>): Promise<Element<TDriver, TContext, TElement, TSelector>[]> {
    return this.currentContext.elements(selector)
  }

  async execute(script: ((arg: any) => any) | string, arg?: any): Promise<any> {
    return this.currentContext.execute(script, arg)
  }

  async takeScreenshot(): Promise<Buffer> {
    const image = await this._spec.takeScreenshot(this.target)
    if (utils.types.isString(image)) {
      return Buffer.from(image.replace(/[\r\n]+/g, ''), 'base64')
    }
    return image
  }

  async getViewportSize(): Promise<types.Size> {
    let size
    if (this.isNative) {
      this._logger.log('Extracting viewport size from native driver')
      if (this._driverInfo?.viewportSize) {
        size = this._driverInfo.viewportSize
      } else {
        size = await this.getDisplaySize()
        if (size.height > size.width) {
          const orientation = await this.getOrientation()
          if (orientation === 'landscape') {
            size = {width: size.height, height: size.width}
          }
        }
      }
      size = utils.geometry.round(size)
    } else if (this._spec.getViewportSize) {
      this._logger.log('Extracting viewport size from web driver using spec method')
      size = await this._spec.getViewportSize(this.target)
    } else {
      this._logger.log('Extracting viewport size from web driver using js snippet')
      size = await this.mainContext.execute(snippets.getViewportSize)
    }

    this._logger.log('Extracted viewport size', size)

    return size
  }

  async setViewportSize(size: types.Size): Promise<void> {
    if (this.isMobile) return
    if (this._spec.setViewportSize) {
      this._logger.log('Setting viewport size to', size, 'using spec method')
      await this._spec.setViewportSize(this.target, size)
      return
    }

    this._logger.log('Setting viewport size to', size, 'using workaround')

    const requiredViewportSize = size
    let currentViewportSize = await this.getViewportSize()
    if (utils.geometry.equals(currentViewportSize, requiredViewportSize)) return

    let currentWindowSize = await this._spec.getWindowSize(this.target)
    this._logger.log('Extracted window size', currentWindowSize)

    let attempt = 0
    while (attempt++ < 3) {
      const requiredWindowSize = {
        width: currentWindowSize.width + (requiredViewportSize.width - currentViewportSize.width),
        height: currentWindowSize.height + (requiredViewportSize.height - currentViewportSize.height),
      }
      this._logger.log(`Attempt #${attempt} to set viewport size by setting window size to`, requiredWindowSize)
      await this._spec.setWindowSize(this.target, requiredWindowSize)

      const prevViewportSize = currentViewportSize
      currentViewportSize = await this.getViewportSize()
      if (utils.geometry.equals(currentViewportSize, prevViewportSize)) {
        currentViewportSize = await this.getViewportSize()
      }
      currentWindowSize = requiredWindowSize
      if (utils.geometry.equals(currentViewportSize, requiredViewportSize)) return
      this._logger.log(`Attempt #${attempt} to set viewport size failed. Current viewport:`, currentViewportSize)
    }

    throw new Error('Failed to set viewport size!')
  }

  async getDisplaySize(): Promise<types.Size> {
    if (this.isWeb && !this.isMobile) return
    const size = await this._spec.getWindowSize(this.target)
    return this.isAndroid ? utils.geometry.scale(size, 1 / this.pixelRatio) : size
  }

  async getOrientation(): Promise<'portrait' | 'landscape'> {
    if (this.isWeb && !this.isMobile) return
    const orientation = this._spec.getOrientation(this.target)
    this._logger.log('Extracted device orientation:', orientation)
    return orientation
  }

  async getCookies(): Promise<types.Cookie[]> {
    if (this.isNative || !this.features.allCookies) return []
    try {
      return (await this._spec.getCookies?.(this.target)) ?? []
    } catch (error) {
      this._driverInfo.features.allCookies = false
      throw error
    }
  }

  async getTitle(): Promise<string> {
    if (this.isNative) return null
    const title = await this._spec.getTitle(this.target)
    this._logger.log('Extracted title:', title)
    return title
  }

  async getUrl(): Promise<string> {
    if (this.isNative) return null
    const url = this._spec.getUrl(this.target)
    this._logger.log('Extracted url:', url)
    return url
  }

  async visit(url: string): Promise<void> {
    await this._spec.visit(this.target, url)
  }
}
