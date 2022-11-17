import * as utils from '@applitools/utils'
import {CoreCheckSettingsAutomation, CoreCheckSettingsImage} from '../Core'
import {EyesSelector} from './EyesSelector'
import {Image} from './Image'
import {AccessibilityRegionType, AccessibilityRegionTypeEnum} from '../enums/AccessibilityRegionType'
import {MatchLevel, MatchLevelEnum} from '../enums/MatchLevel'
import {Region, LegacyRegion} from './Region'
import {Location} from './Location'
import {LazyLoadOptions} from './LazyLoadOptions'

type RegionReference<TElement, TSelector> = Region | ElementReference<TElement, TSelector>
type ElementReference<TElement, TSelector> = TElement | SelectorReference<TSelector>
type SelectorReference<TSelector> = EyesSelector<TSelector>
type FrameReference<TElement, TSelector> = ElementReference<TElement, TSelector> | string | number
type ContextReference<TElement, TSelector> = {
  frame: FrameReference<TElement, TSelector>
  scrollRootElement?: ElementReference<TElement, TSelector>
}

type CodedRegion<TRegion = never> = {
  region: Region | TRegion
  padding?: number | {top: number; bottom: number; let: number; right: number}
  regionId?: string
}
type CodedFloatingRegion<TRegion = never> = CodedRegion<TRegion> & {
  offset?: {top?: number; bottom?: number; left?: number; right?: number}
}
/** @deprecated */
type LegacyCodedFloatingRegion<TRegion = never> = CodedRegion<TRegion> & {
  maxUpOffset?: number
  maxDownOffset?: number
  maxLeftOffset?: number
  maxRightOffset?: number
}
type CodedAccessibilityRegion<TRegion = never> = CodedRegion<TRegion> & {
  type?: AccessibilityRegionType
}

export type CheckSettingsBase<TRegion = never> = {
  name?: string
  region?: Region | TRegion
  matchLevel?: MatchLevel
  useDom?: boolean
  sendDom?: boolean
  enablePatterns?: boolean
  ignoreDisplacements?: boolean
  ignoreMismatch?: boolean
  ignoreCaret?: boolean
  ignoreRegions?: (CodedRegion<TRegion> | Region | TRegion)[]
  layoutRegions?: (CodedRegion<TRegion> | Region | TRegion)[]
  strictRegions?: (CodedRegion<TRegion> | Region | TRegion)[]
  contentRegions?: (CodedRegion<TRegion> | Region | TRegion)[]
  floatingRegions?: (CodedFloatingRegion<TRegion> | LegacyCodedFloatingRegion<TRegion> | Region | TRegion)[]
  accessibilityRegions?: (CodedAccessibilityRegion<TRegion> | Region | TRegion)[]
  pageId?: string
  variationGroupId?: string
}

export type CheckSettingsImage = CheckSettingsBase

export type CheckSettingsAutomation<TElement, TSelector> = CheckSettingsBase<RegionReference<TElement, TSelector>> & {
  frames?: (ContextReference<TElement, TSelector> | FrameReference<TElement, TSelector>)[]
  webview?: boolean | string
  scrollRootElement?: ElementReference<TElement, TSelector>
  fully?: boolean
  disableBrowserFetching?: boolean
  layoutBreakpoints?: boolean | number[]
  visualGridOptions?: {[key: string]: any}
  hooks?: {beforeCaptureScreenshot: string}
  renderId?: string
  timeout?: number
  waitBeforeCapture?: number
  lazyLoad?: boolean | LazyLoadOptions
}

export class CheckSettingsBaseFluent<TRegion = never> {
  protected _settings: CheckSettingsBase<TRegion> = {}

  constructor(settings?: CheckSettingsBase<TRegion> | CheckSettingsBaseFluent<TRegion>) {
    this._settings = utils.types.instanceOf(settings, CheckSettingsBaseFluent) ? settings.toObject() : settings ?? {}
  }

  region(region: Region | LegacyRegion | TRegion): this {
    if (utils.types.has(region, ['left', 'top', 'width', 'height'])) {
      region = {x: region.left, y: region.top, width: region.width, height: region.height}
    }
    this._settings.region = region
    return this
  }

  name(name: string): this {
    this._settings.name = name
    return this
  }
  withName(name: string) {
    return this.name(name)
  }

  ignoreRegion(region: CodedRegion<TRegion> | Region | LegacyRegion | TRegion): this {
    if (!this._settings.ignoreRegions) this._settings.ignoreRegions = []
    if (utils.types.has(region, ['left', 'top', 'width', 'height'])) {
      region = {x: region.left, y: region.top, width: region.width, height: region.height}
    }
    this._settings.ignoreRegions.push(region)
    return this
  }
  ignoreRegions(...regions: (CodedRegion<TRegion> | Region | LegacyRegion | TRegion)[]): this {
    regions.forEach(region => this.ignoreRegion(region))
    return this
  }
  /** @deprecated */
  ignore(region: Region | LegacyRegion | TRegion) {
    return this.ignoreRegion(region)
  }
  /** @deprecated */
  ignores(...regions: (Region | LegacyRegion | TRegion)[]): this {
    return this.ignoreRegions(...regions)
  }

  layoutRegion(region: CodedRegion<TRegion> | Region | LegacyRegion | TRegion): this {
    if (!this._settings.layoutRegions) this._settings.layoutRegions = []
    if (utils.types.has(region, ['left', 'top', 'width', 'height'])) {
      region = {x: region.left, y: region.top, width: region.width, height: region.height}
    }
    this._settings.layoutRegions.push(region)
    return this
  }
  layoutRegions(...regions: (CodedRegion<TRegion> | Region | LegacyRegion | TRegion)[]): this {
    regions.forEach(region => this.layoutRegion(region))
    return this
  }

  strictRegion(region: CodedRegion<TRegion> | Region | LegacyRegion | TRegion): this {
    if (!this._settings.strictRegions) this._settings.strictRegions = []
    if (utils.types.has(region, ['left', 'top', 'width', 'height'])) {
      region = {x: region.left, y: region.top, width: region.width, height: region.height}
    }
    this._settings.strictRegions.push(region)
    return this
  }
  strictRegions(...regions: (CodedRegion<TRegion> | Region | LegacyRegion | TRegion)[]): this {
    regions.forEach(region => this.strictRegion(region))
    return this
  }

  contentRegion(region: CodedRegion<TRegion> | Region | LegacyRegion | TRegion): this {
    if (!this._settings.contentRegions) this._settings.contentRegions = []
    if (utils.types.has(region, ['left', 'top', 'width', 'height'])) {
      region = {x: region.left, y: region.top, width: region.width, height: region.height}
    }
    this._settings.contentRegions.push(region)
    return this
  }
  contentRegions(...regions: (CodedRegion<TRegion> | Region | LegacyRegion | TRegion)[]): this {
    regions.forEach(region => this.contentRegion(region))
    return this
  }

  floatingRegion(region: CodedFloatingRegion<TRegion>): this
  floatingRegion(region: LegacyCodedFloatingRegion<TRegion>): this
  floatingRegion(
    region: Region | LegacyRegion | TRegion,
    maxUpOffset?: number,
    maxDownOffset?: number,
    maxLeftOffset?: number,
    maxRightOffset?: number,
  ): this
  floatingRegion(
    region: CodedFloatingRegion<TRegion> | Region | LegacyCodedFloatingRegion<TRegion> | LegacyRegion | TRegion,
    maxUpOffset?: number,
    maxDownOffset?: number,
    maxLeftOffset?: number,
    maxRightOffset?: number,
  ): this {
    if (utils.types.has(region, ['left', 'top', 'width', 'height'])) {
      region = {x: region.left, y: region.top, width: region.width, height: region.height}
    }

    let floatingRegion: CodedFloatingRegion<TRegion>
    if (utils.types.has(region, 'region')) {
      const {maxUpOffset, maxDownOffset, maxLeftOffset, maxRightOffset, ...rest} = region as any
      floatingRegion = {
        offset: {top: maxUpOffset, bottom: maxDownOffset, left: maxLeftOffset, right: maxRightOffset},
        ...rest,
      }
    } else {
      floatingRegion = {
        region,
        offset: {top: maxUpOffset, bottom: maxDownOffset, left: maxLeftOffset, right: maxRightOffset},
      }
    }
    if (!this._settings.floatingRegions) this._settings.floatingRegions = []
    this._settings.floatingRegions.push(floatingRegion)
    return this
  }
  floatingRegions(...regions: (CodedFloatingRegion<TRegion> | Region | LegacyRegion | TRegion)[]): this
  floatingRegions(maxOffset: number, ...regions: (Region | LegacyRegion | TRegion)[]): this
  floatingRegions(
    regionOrMaxOffset: CodedFloatingRegion<TRegion> | Region | LegacyRegion | TRegion | number,
    ...regions: (CodedFloatingRegion<TRegion> | Region | LegacyRegion | TRegion)[]
  ): this {
    let maxOffset: number
    if (utils.types.isNumber(regionOrMaxOffset)) {
      maxOffset = regionOrMaxOffset
    } else {
      this.floatingRegion(regionOrMaxOffset as CodedFloatingRegion<TRegion>)
    }
    regions.forEach(region => {
      if (utils.types.has(region, 'region')) this.floatingRegion(region)
      else this.floatingRegion(region, maxOffset, maxOffset, maxOffset, maxOffset)
    })
    return this
  }
  /** @deprecated */
  floating(region: CodedFloatingRegion<TRegion>): this
  /** @deprecated */
  floating(region: Region | LegacyRegion | TRegion): this
  floating(
    region: CodedFloatingRegion<TRegion> | Region | LegacyRegion | TRegion,
    maxUpOffset?: number,
    maxDownOffset?: number,
    maxLeftOffset?: number,
    maxRightOffset?: number,
  ): this {
    if (utils.types.has(region, 'region')) return this.floatingRegion(region)
    else return this.floatingRegion(region, maxUpOffset, maxDownOffset, maxLeftOffset, maxRightOffset)
  }
  /** @deprecated */
  floatings(...regions: (CodedFloatingRegion<TRegion> | Region | LegacyRegion | TRegion)[]): this
  /** @deprecated */
  floatings(maxOffset: number, ...regions: (Region | LegacyRegion | TRegion)[]): this
  floatings(
    regionOrMaxOffset: CodedFloatingRegion<TRegion> | Region | LegacyRegion | TRegion | number,
    ...regions: (CodedFloatingRegion<TRegion> | Region | LegacyRegion | TRegion)[]
  ): this {
    return this.floatingRegions(regionOrMaxOffset as number, ...(regions as TRegion[]))
  }

  accessibilityRegion(region: CodedAccessibilityRegion<TRegion>): this
  accessibilityRegion(region: Region | LegacyRegion | TRegion, type?: AccessibilityRegionType): this
  accessibilityRegion(
    region: CodedAccessibilityRegion<TRegion> | Region | LegacyRegion | TRegion,
    type?: AccessibilityRegionType,
  ): this {
    if (utils.types.has(region, ['left', 'top', 'width', 'height'])) {
      region = {x: region.left, y: region.top, width: region.width, height: region.height}
    }
    const accessibilityRegion = utils.types.has(region, 'region') ? region : {region, type}
    if (!this._settings.accessibilityRegions) this._settings.accessibilityRegions = []
    this._settings.accessibilityRegions.push(accessibilityRegion)
    return this
  }
  accessibilityRegions(...regions: (CodedAccessibilityRegion<TRegion> | Region | LegacyRegion | TRegion)[]): this
  accessibilityRegions(type: AccessibilityRegionType, ...regions: (Region | LegacyRegion | TRegion)[]): this
  accessibilityRegions(
    regionOrType: CodedAccessibilityRegion<TRegion> | Region | LegacyRegion | TRegion | AccessibilityRegionType,
    ...regions: (CodedAccessibilityRegion<TRegion> | Region | LegacyRegion | TRegion)[]
  ): this {
    let type: AccessibilityRegionType
    if (utils.types.isEnumValue(regionOrType, AccessibilityRegionTypeEnum)) {
      type = regionOrType
    } else {
      this.accessibilityRegion(regionOrType as CodedAccessibilityRegion<TRegion>)
    }
    regions.forEach(region => {
      if (utils.types.has(region, 'region')) this.accessibilityRegion(region)
      else this.accessibilityRegion(region, type)
    })
    return this
  }

  matchLevel(matchLevel: MatchLevel): this {
    this._settings.matchLevel = matchLevel
    return this
  }
  layout(): this {
    this._settings.matchLevel = MatchLevelEnum.Layout
    return this
  }
  exact(): this {
    this._settings.matchLevel = MatchLevelEnum.Exact
    return this
  }
  strict(): this {
    this._settings.matchLevel = MatchLevelEnum.Strict
    return this
  }
  content(): this {
    this._settings.matchLevel = MatchLevelEnum.Content
    return this
  }

  enablePatterns(enablePatterns = true): this {
    this._settings.enablePatterns = enablePatterns
    return this
  }

  ignoreDisplacements(ignoreDisplacements = true): this {
    this._settings.ignoreDisplacements = ignoreDisplacements
    return this
  }

  ignoreCaret(ignoreCaret = true): this {
    this._settings.ignoreCaret = ignoreCaret
    return this
  }

  useDom(useDom = true): this {
    this._settings.useDom = useDom
    return this
  }

  sendDom(sendDom = true): this {
    this._settings.sendDom = sendDom
    return this
  }

  pageId(pageId: string): this {
    this._settings.pageId = pageId
    return this
  }

  variationGroupId(variationGroupId: string): this {
    this._settings.variationGroupId = variationGroupId
    return this
  }

  /** @internal */
  toObject(): CheckSettingsBase<TRegion> {
    return this._settings
  }

  /** @internal */
  toString(): string {
    return utils.general.toString(this)
  }
}

export class CheckSettingsImageFluent extends CheckSettingsBaseFluent {
  protected _settings: CheckSettingsImage
  protected _target: Image

  constructor(settings?: CheckSettingsImage | CheckSettingsImageFluent, target?: Image) {
    super(settings)
    this._target = target ?? (settings as CheckSettingsImageFluent)?._target
  }

  image(image: Buffer | URL | string): this {
    this._target ??= {} as Image
    this._target.image = image
    return this
  }
  buffer(imageBuffer: Buffer): this {
    return this.image(imageBuffer)
  }
  base64(imageBase64: Buffer): this {
    return this.image(imageBase64)
  }
  path(imagePath: string): this {
    return this.image(imagePath)
  }
  url(imageUrl: URL | string): this {
    return this.image(imageUrl)
  }

  name(name: string): this {
    this._target.name = name
    return super.name(name)
  }

  withDom(dom: string): this {
    this._settings.sendDom = true
    this._target.dom = dom
    return this
  }

  withLocation(locationInViewport: Location): this {
    this._target.locationInViewport = locationInViewport
    return this
  }

  /** @internal */
  toJSON(): {target: Image; settings: CoreCheckSettingsImage} {
    return {
      target: this._target,
      settings: utils.general.removeUndefinedProps({
        name: this._settings.name,
        region: this._settings.region,
        matchLevel: this._settings.matchLevel,
        useDom: this._settings.useDom,
        sendDom: this._settings.sendDom,
        enablePatterns: this._settings.enablePatterns,
        ignoreDisplacements: this._settings.ignoreDisplacements,
        ignoreCaret: this._settings.ignoreCaret,
        ignoreRegions: this._settings.ignoreRegions,
        layoutRegions: this._settings.layoutRegions,
        strictRegions: this._settings.strictRegions,
        contentRegions: this._settings.contentRegions,
        floatingRegions: this._settings.floatingRegions,
        accessibilityRegions: this._settings.accessibilityRegions,
        pageId: this._settings.pageId,
        userCommandId: this._settings.variationGroupId,
      }),
    }
  }
}

type CheckSettingsAutomationSpec<TElement = unknown, TSelector = unknown> = {
  isElement(value: any): value is TElement
  isSelector(value: any): value is TSelector
}

export class CheckSettingsAutomationFluent<TElement = unknown, TSelector = unknown> extends CheckSettingsBaseFluent<
  RegionReference<TElement, TSelector>
> {
  protected _settings: CheckSettingsAutomation<TElement, TSelector>

  protected static readonly _spec: CheckSettingsAutomationSpec<any, any>
  protected _spec: CheckSettingsAutomationSpec<TElement, TSelector>

  protected _isElementReference(value: any): value is ElementReference<TSelector, TElement> {
    const spec = this._spec ?? ((this.constructor as typeof CheckSettingsAutomationFluent)._spec as typeof this._spec)
    return spec.isElement(value) || this._isSelectorReference(value)
  }
  protected _isSelectorReference(selector: any): selector is SelectorReference<TSelector> {
    const spec = this._spec ?? ((this.constructor as typeof CheckSettingsAutomationFluent)._spec as typeof this._spec)
    return (
      spec.isSelector(selector) ||
      utils.types.isString(selector) ||
      (utils.types.isPlainObject(selector) &&
        utils.types.has(selector, 'selector') &&
        (utils.types.isString(selector.selector) || spec.isSelector(selector.selector)))
    )
  }
  protected _isFrameReference(value: any): value is FrameReference<TSelector, TElement> {
    return utils.types.isNumber(value) || utils.types.isString(value) || this._isElementReference(value)
  }

  constructor(
    settings?: CheckSettingsAutomation<TElement, TSelector> | CheckSettingsAutomationFluent<TElement, TSelector>,
    spec?: CheckSettingsAutomationSpec<TElement, TSelector>,
  ) {
    super(settings)
    this._spec = spec
  }

  region(region: RegionReference<TElement, TSelector>) {
    if (
      this._isSelectorReference(region) &&
      this._isSelectorReference(this._settings.region) &&
      utils.types.has(this._settings.region, 'selector')
    ) {
      let lastSelector: any = this._settings.region
      while (lastSelector.shadow) lastSelector = lastSelector.shadow
      lastSelector.shadow = region
      return this
    }
    return super.region(region)
  }

  shadow(selector: SelectorReference<TSelector>): this {
    selector = utils.types.has(selector, 'selector') ? selector : {selector}

    if (!this._settings.region) {
      this._settings.region = selector
    } else if (this._isSelectorReference(this._settings.region)) {
      let lastSelector: any
      if (utils.types.has(this._settings.region, 'selector')) {
        lastSelector = this._settings.region
        while (lastSelector.shadow) lastSelector = lastSelector.shadow
      } else {
        lastSelector = {selector: this._settings.region}
      }
      lastSelector.shadow = selector
    }

    return this
  }

  frame(context: ContextReference<TElement, TSelector>): this
  frame(frame: FrameReference<TElement, TSelector>, scrollRootElement?: ElementReference<TElement, TSelector>): this
  frame(
    contextOrFrame: ContextReference<TElement, TSelector> | FrameReference<TElement, TSelector>,
    scrollRootElement?: ElementReference<TElement, TSelector>,
  ): this {
    const context: ContextReference<TElement, TSelector> =
      this._isFrameReference(contextOrFrame) || this._isSelectorReference(contextOrFrame)
        ? {frame: contextOrFrame, scrollRootElement}
        : contextOrFrame
    if (!this._settings.frames) this._settings.frames = []
    this._settings.frames.push(context)
    return this
  }

  webview(webview?: string | boolean): this {
    this._settings.webview = webview ?? true
    return this
  }

  scrollRootElement(scrollRootElement: ElementReference<TElement, TSelector>): this {
    if (this._settings.frames && this._settings.frames.length > 0) {
      const context = this._settings.frames[this._settings.frames.length - 1] as ContextReference<TElement, TSelector>
      context.scrollRootElement = scrollRootElement
    }
    this._settings.scrollRootElement = scrollRootElement
    return this
  }

  fully(fully = true): this {
    this._settings.fully = fully
    return this
  }
  /** @deprecated */
  stitchContent(stitchContent = true) {
    return this.fully(stitchContent)
  }

  disableBrowserFetching(disableBrowserFetching: boolean): this {
    this._settings.disableBrowserFetching = disableBrowserFetching
    return this
  }

  layoutBreakpoints(layoutBreakpoints: boolean | number[] = true): this {
    if (!utils.types.isArray(layoutBreakpoints)) {
      this._settings.layoutBreakpoints = layoutBreakpoints
    } else if (layoutBreakpoints.length === 0) {
      this._settings.layoutBreakpoints = false
    } else {
      this._settings.layoutBreakpoints = Array.from(new Set(layoutBreakpoints)).sort((a, b) => (a < b ? 1 : -1))
    }
    return this
  }

  hook(name: string, script: string): this {
    this._settings.hooks = {...this._settings.hooks, [name]: script}
    return this
  }
  beforeRenderScreenshotHook(script: string): this {
    return this.hook('beforeCaptureScreenshot', script)
  }
  /** @deprecated */
  webHook(script: string): this {
    return this.beforeRenderScreenshotHook(script)
  }

  ufgOption(key: string, value: any) {
    this._settings.visualGridOptions = {...this._settings.visualGridOptions, [key]: value}
    return this
  }
  ufgOptions(options: {[key: string]: any}) {
    this._settings.visualGridOptions = options
    return this
  }
  /** @deprecated */
  visualGridOption(key: string, value: any) {
    return this.ufgOption(key, value)
  }
  /** @deprecated */
  visualGridOptions(options: {[key: string]: any}) {
    return this.ufgOptions(options)
  }

  renderId(renderId: string): this {
    this._settings.renderId = renderId
    return this
  }

  timeout(timeout: number): this {
    this._settings.timeout = timeout
    return this
  }

  waitBeforeCapture(waitBeforeCapture: number): this {
    this._settings.waitBeforeCapture = waitBeforeCapture
    return this
  }

  lazyLoad(options?: LazyLoadOptions | boolean): this {
    this._settings.lazyLoad = options ?? true
    return this
  }

  /** @internal */
  toJSON(): {target: undefined; settings: CoreCheckSettingsAutomation<TElement, TSelector>} {
    return {
      target: undefined,
      settings: utils.general.removeUndefinedProps({
        name: this._settings.name,
        region: this._settings.region,
        frames: this._settings.frames,
        webview: this._settings.webview,
        scrollRootElement: this._settings.scrollRootElement,
        fully: this._settings.fully,
        matchLevel: this._settings.matchLevel,
        useDom: this._settings.useDom,
        sendDom: this._settings.sendDom,
        enablePatterns: this._settings.enablePatterns,
        ignoreDisplacements: this._settings.ignoreDisplacements,
        ignoreCaret: this._settings.ignoreCaret,
        ignoreRegions: this._settings.ignoreRegions,
        layoutRegions: this._settings.layoutRegions,
        strictRegions: this._settings.strictRegions,
        contentRegions: this._settings.contentRegions,
        floatingRegions:
          this._settings.floatingRegions &&
          this._settings.floatingRegions.map(floatingRegion => {
            if (utils.types.has(floatingRegion, 'region')) {
              const {maxUpOffset, maxDownOffset, maxLeftOffset, maxRightOffset, ...rest} =
                floatingRegion as LegacyCodedFloatingRegion
              return {
                offset: {top: maxUpOffset, bottom: maxDownOffset, left: maxLeftOffset, right: maxRightOffset},
                ...rest,
              }
            }
            return floatingRegion
          }),
        accessibilityRegions: this._settings.accessibilityRegions,
        disableBrowserFetching: this._settings.disableBrowserFetching,
        layoutBreakpoints: this._settings.layoutBreakpoints,
        ufgOptions: this._settings.visualGridOptions,
        hooks: this._settings.hooks,
        pageId: this._settings.pageId,
        lazyLoad: this._settings.lazyLoad,
        waitBeforeCapture: this._settings.waitBeforeCapture,
        retryTimeout: this._settings.timeout,
        userCommandId: this._settings.variationGroupId,
      }),
    }
  }
}

export type TargetImage = {
  image(image: Buffer | URL | string): CheckSettingsImageFluent
  buffer(imageBuffer: Buffer): CheckSettingsImageFluent
  base64(imageBase64: string): CheckSettingsImageFluent
  path(imagePath: string): CheckSettingsImageFluent
  url(imageUrl: URL | string): CheckSettingsImageFluent
}

export type TargetAutomation<TElement, TSelector> = {
  window(): CheckSettingsAutomationFluent<TElement, TSelector>
  region(
    region: RegionReference<TElement, TSelector> | LegacyRegion,
  ): CheckSettingsAutomationFluent<TElement, TSelector>
  frame(context: ContextReference<TElement, TSelector>): CheckSettingsAutomationFluent<TElement, TSelector>
  frame(
    frame: FrameReference<TElement, TSelector>,
    scrollRootElement?: ElementReference<TElement, TSelector>,
  ): CheckSettingsAutomationFluent<TElement, TSelector>
  shadow(selector: SelectorReference<TSelector>): CheckSettingsAutomationFluent<TSelector>
  webview(webview?: string | boolean): CheckSettingsAutomationFluent<TElement, TSelector>
}

export type Target<TElement, TSelector> = TargetImage & TargetAutomation<TElement, TSelector>

export const Target: Target<unknown, unknown> & {spec?: CheckSettingsAutomationSpec} = {
  spec: null as CheckSettingsAutomationSpec,

  image(image: Buffer | URL | string): CheckSettingsImageFluent {
    return new CheckSettingsImageFluent().image(image)
  },
  buffer(imageBuffer: Buffer): CheckSettingsImageFluent {
    return new CheckSettingsImageFluent().image(imageBuffer)
  },
  base64(imageBase64: string): CheckSettingsImageFluent {
    return new CheckSettingsImageFluent().image(imageBase64)
  },
  path(imagePath: string): CheckSettingsImageFluent {
    return new CheckSettingsImageFluent().image(imagePath)
  },
  url(imageUrl: URL | string): CheckSettingsImageFluent {
    return new CheckSettingsImageFluent().image(imageUrl)
  },
  window(): CheckSettingsAutomationFluent {
    return new CheckSettingsAutomationFluent({}, this.spec)
  },
  region(region: unknown): CheckSettingsAutomationFluent {
    return new CheckSettingsAutomationFluent({}, this.spec).region(region)
  },
  frame(contextOrFrame: unknown, scrollRootElement?: unknown): CheckSettingsAutomationFluent {
    return new CheckSettingsAutomationFluent({}, this.spec).frame(contextOrFrame, scrollRootElement)
  },
  shadow(selector: unknown): CheckSettingsAutomationFluent {
    return new CheckSettingsAutomationFluent({}, this.spec).shadow(selector)
  },
  webview(webview: string | boolean | null): CheckSettingsAutomationFluent {
    return new CheckSettingsAutomationFluent({}, this.spec).webview(webview)
  },
}
