import type * as types from '@applitools/types'
import {type Logger, makeLogger} from '@applitools/logger'
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
  private _logger: Logger
  private _customConfig: types.CustomDriverConfig
  private _helper?:
    | HelperAndroid<TDriver, TContext, TElement, TSelector>
    | HelperIOS<TDriver, TContext, TElement, TSelector>

  protected readonly _spec: types.SpecDriver<TDriver, TContext, TElement, TSelector>

  constructor(options: {
    spec: types.SpecDriver<TDriver, TContext, TElement, TSelector>
    driver: Driver<TDriver, TContext, TElement, TSelector> | TDriver
    logger?: Logger
    customConfig?: types.CustomDriverConfig
  }) {
    if (options.driver instanceof Driver) return options.driver

    this._customConfig = options.customConfig ?? {}

    this._spec = options.spec

    this._logger = options.logger?.extend({label: 'driver'}) ?? makeLogger({label: 'driver'})

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
  get orientation(): 'portrait' | 'landscape' | 'portrait-secondary' | 'landscape-secondary' {
    return this._driverInfo.orientation
  }
  get pixelRatio(): number {
    return this._driverInfo.pixelRatio ?? 1
  }
  get viewportScale(): number {
    return this._driverInfo.viewportScale ?? 1
  }
  get statusBarSize(): number {
    return this._driverInfo.statusBarSize ?? (this.isNative ? 0 : undefined)
  }
  get navigationBarSize(): number {
    return this._driverInfo.navigationBarSize ?? (this.isNative ? 0 : undefined)
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

    const capabilitiesInfo = capabilities ? parseCapabilities(capabilities, this._customConfig) : undefined
    const driverInfo = await this._spec.getDriverInfo?.(this.target)

    this._driverInfo = {...capabilitiesInfo, ...driverInfo}

    if (this.isMobile) {
      this._driverInfo.orientation =
        (await this.getOrientation().catch(() => undefined)) ?? this._driverInfo.orientation
    }

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
      // this value always excludes the height of the navigation bar, and sometimes it also excludes the height of the status bar
      let windowSize = await this._spec.getWindowSize(this.target)
      this._driverInfo.displaySize ??= windowSize

      if (
        this.orientation?.startsWith('landscape') &&
        this._driverInfo.displaySize.height > this._driverInfo.displaySize.width
      ) {
        this._driverInfo.displaySize = {
          width: this._driverInfo.displaySize.height,
          height: this._driverInfo.displaySize.width,
        }
      }

      if (this.isAndroid) {
        // bar sizes could be extracted only on android
        const systemBars = await this._spec.getSystemBars?.(this.target).catch(() => null as never)
        const {statusBar, navigationBar} = systemBars ?? {}

        if (statusBar?.visible) {
          this._logger.log('Driver status bar', statusBar)

          const statusBarSize = statusBar.height

          // when status bar is overlapping content on android it returns status bar height equal to display height
          if (statusBarSize < this._driverInfo.displaySize.height) {
            this._driverInfo.statusBarSize = Math.max(this._driverInfo.statusBarSize ?? 0, statusBarSize)
          }
        }
        if (navigationBar?.visible) {
          this._logger.log('Driver navigation size', navigationBar)

          // if navigation bar is placed on the right side is screen the the orientation is landscape-secondary
          if (navigationBar.x > 0) this._driverInfo.orientation = 'landscape-secondary'

          // navigation bar size could be its height or width depending on screen orientation
          const navigationBarSize = navigationBar[this.orientation?.startsWith('landscape') ? 'width' : 'height']

          // when navigation bar is invisible on android it returns navigation bar size equal to display size
          if (
            navigationBarSize <
            this._driverInfo.displaySize[this.orientation?.startsWith('landscape') ? 'width' : 'height']
          ) {
            this._driverInfo.navigationBarSize = Math.max(this._driverInfo.navigationBarSize ?? 0, navigationBarSize)
          } else {
            this._driverInfo.navigationBarSize = 0
          }
        }

        // bar sizes have to be scaled on android
        this._driverInfo.statusBarSize &&= this._driverInfo.statusBarSize / this.pixelRatio
        this._driverInfo.navigationBarSize &&= this._driverInfo.navigationBarSize / this.pixelRatio

        windowSize = utils.geometry.scale(windowSize, 1 / this.pixelRatio)
        this._driverInfo.displaySize &&= utils.geometry.scale(this._driverInfo.displaySize, 1 / this.pixelRatio)
      }

      if (this.isIOS) {
        if (this.orientation?.startsWith('landscape')) this._driverInfo.statusBarSize = 0
      }

      // calculate viewport location
      this._driverInfo.viewportLocation ??= {
        x: this.orientation === 'landscape' ? this.navigationBarSize : 0,
        y: this.statusBarSize,
      }

      // calculate viewport size
      if (!this._driverInfo.viewportSize) {
        this._driverInfo.viewportSize = {...this._driverInfo.displaySize}
        this._driverInfo.viewportSize.height -= this.statusBarSize
        if (this.isAndroid) {
          this._driverInfo.viewportSize[this.orientation?.startsWith('landscape') ? 'width' : 'height'] -=
            this.navigationBarSize
        }
      }

      // calculate safe area
      if (this.isIOS && !this._driverInfo.safeArea) {
        this._driverInfo.safeArea = {x: 0, y: 0, ...this._driverInfo.displaySize}
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
    if (this.isWeb) return region

    let normalizedRegion = region
    if (this.isAndroid) {
      normalizedRegion = utils.geometry.scale(normalizedRegion, 1 / this.pixelRatio)
    }
    if (this.isIOS && utils.geometry.isIntersected(normalizedRegion, this._driverInfo.safeArea)) {
      normalizedRegion = utils.geometry.intersect(normalizedRegion, this._driverInfo.safeArea)
    }
    normalizedRegion = utils.geometry.offsetNegative(normalizedRegion, this._driverInfo.viewportLocation)
    if (normalizedRegion.y < 0) {
      normalizedRegion.height += normalizedRegion.y
      normalizedRegion.y = 0
    }
    return normalizedRegion
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

  async getViewportRegion(): Promise<types.Region> {
    return {
      ...(this._driverInfo?.viewportLocation ?? {x: 0, y: 0}),
      ...(await this.getViewportSize()),
    }
  }

  async getViewportSize(): Promise<types.Size> {
    let size
    if (this.isNative) {
      if (this._driverInfo?.viewportSize) {
        this._logger.log('Extracting viewport size from native driver using cached value')
        size = this._driverInfo.viewportSize
      } else {
        this._logger.log('Extracting viewport size from native driver')
        size = await this.getDisplaySize()
        size.height -= this.statusBarSize
      }
      this._logger.log(`Rounding viewport size using`, this._customConfig.useCeilForViewportSize ? 'ceil' : 'round')
      if (this._customConfig.useCeilForViewportSize) {
        size = utils.geometry.ceil(size)
      } else {
        size = utils.geometry.round(size)
      }
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
    if (this._driverInfo?.displaySize) {
      this._logger.log('Extracting display size from native driver using cached value')
      return this._driverInfo.displaySize
    }
    let size = await this._spec.getWindowSize(this.target)
    if ((await this.getOrientation())?.startsWith('landscape') && size.height > size.width) {
      size = {width: size.height, height: size.width}
    }
    const normalizedSize = this.isAndroid ? utils.geometry.scale(size, 1 / this.pixelRatio) : size
    this._logger.log('Extracted and normalized display size:', normalizedSize)
    return normalizedSize
  }

  async getOrientation(): Promise<'portrait' | 'landscape' | 'portrait-secondary' | 'landscape-secondary'> {
    if (this.isWeb && !this.isMobile) return
    let orientation
    if (this.isAndroid) {
      this._logger.log('Extracting device orientation using adb command on android')

      const rotation = await this.execute('mobile:shell', {
        command: "dumpsys window | grep 'mCurrentRotation' | cut -d = -f2",
      })
        .then(r => r?.trim?.())
        .catch(() => null as never)

      if (rotation === 'ROTATION_0' || rotation === '0') orientation = 'portrait'
      else if (rotation === 'ROTATION_90' || rotation === '3') orientation = 'landscape-secondary'
      else if (rotation === 'ROTATION_180' || rotation === '2') orientation = 'portrait-secondary'
      else if (rotation === 'ROTATION_270' || rotation === '1') orientation = 'landscape'
    }
    if (!orientation) {
      this._logger.log('Extracting device orientation')
      orientation = await this._spec.getOrientation(this.target)
    }
    this._logger.log('Extracted device orientation:', orientation)
    return orientation
  }

  async setOrientation(orientation: 'portrait' | 'landscape'): Promise<void> {
    if (this.isWeb && !this.isMobile) return
    this._logger.log('Set device orientation:', orientation)
    await this._spec.setOrientation(this.target, orientation)
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
    const url = await this._spec.getUrl(this.target)
    this._logger.log('Extracted url:', url)
    return url
  }

  async visit(url: string): Promise<void> {
    await this._spec.visit(this.target, url)
  }
}
