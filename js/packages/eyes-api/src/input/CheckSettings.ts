import type * as types from '@applitools/types'
import * as utils from '@applitools/utils'
import {AccessibilityRegionType, AccessibilityRegionTypeEnum} from '../enums/AccessibilityRegionType'
import {MatchLevel, MatchLevelEnum} from '../enums/MatchLevel'
import {Region, LegacyRegion} from './Region'
import {LazyLoadOptions} from './LazyLoadOptions'

type RegionReference<TElement, TSelector> = Region | ElementReference<TElement, TSelector>

type ElementReference<TElement, TSelector> = TElement | SelectorReference<TSelector>

type SelectorReference<TSelector> = types.Selector<TSelector>

type FrameReference<TElement, TSelector> = ElementReference<TElement, TSelector> | string | number

type ContextReference<TElement, TSelector> = {
  frame: FrameReference<TElement, TSelector>
  scrollRootElement?: ElementReference<TElement, TSelector>
}

type CodedRegionReference<TElement, TSelector> = {
  region: RegionReference<TElement, TSelector>
  padding?: number | types.OffsetRect
  regionId?: string
}

type FloatingRegionReference<TElement, TSelector> = CodedRegionReference<TElement, TSelector> & {
  offset?: {top?: number; bottom?: number; left?: number; right?: number}
}

/** @deprecated */
type LegacyFloatingRegionReference<TElement, TSelector> = CodedRegionReference<TElement, TSelector> & {
  maxUpOffset?: number
  maxDownOffset?: number
  maxLeftOffset?: number
  maxRightOffset?: number
}

type AccessibilityRegionReference<TElement, TSelector> = CodedRegionReference<TElement, TSelector> & {
  type?: AccessibilityRegionType
}

type CheckSettingsSpec<TElement = unknown, TSelector = unknown> = {
  isElement(value: any): value is TElement
  isSelector(value: any): value is TSelector
}

export type CheckSettings<TElement, TSelector> = {
  name?: string
  region?: RegionReference<TElement, TSelector>
  frames?: (ContextReference<TElement, TSelector> | FrameReference<TElement, TSelector>)[]
  scrollRootElement?: ElementReference<TElement, TSelector>
  fully?: boolean
  matchLevel?: MatchLevel
  useDom?: boolean
  sendDom?: boolean
  enablePatterns?: boolean
  ignoreDisplacements?: boolean
  ignoreCaret?: boolean
  ignoreRegions?: (RegionReference<TElement, TSelector> | CodedRegionReference<TElement, TSelector>)[]
  layoutRegions?: (RegionReference<TElement, TSelector> | CodedRegionReference<TElement, TSelector>)[]
  strictRegions?: (RegionReference<TElement, TSelector> | CodedRegionReference<TElement, TSelector>)[]
  contentRegions?: (RegionReference<TElement, TSelector> | CodedRegionReference<TElement, TSelector>)[]
  floatingRegions?: (
    | FloatingRegionReference<TElement, TSelector>
    | LegacyFloatingRegionReference<TElement, TSelector>
    | RegionReference<TElement, TSelector>
  )[]
  accessibilityRegions?: (AccessibilityRegionReference<TElement, TSelector> | RegionReference<TElement, TSelector>)[]
  disableBrowserFetching?: boolean
  layoutBreakpoints?: boolean | number[]
  visualGridOptions?: {[key: string]: any}
  hooks?: {beforeCaptureScreenshot: string}
  renderId?: string
  pageId?: string
  variationGroupId?: string
  timeout?: number
  waitBeforeCapture?: number
  lazyLoad?: boolean | LazyLoadOptions
}

export type Target<TElement, TSelector> = {
  window(): CheckSettingsFluent<TElement, TSelector>
  region(region: RegionReference<TElement, TSelector> | LegacyRegion): CheckSettingsFluent<TElement, TSelector>
  frame(context: ContextReference<TElement, TSelector>): CheckSettingsFluent<TElement, TSelector>
  frame(
    frame: FrameReference<TElement, TSelector>,
    scrollRootElement?: ElementReference<TElement, TSelector>,
  ): CheckSettingsFluent<TElement, TSelector>
  shadow(selector: SelectorReference<TSelector>): CheckSettingsFluent<TSelector>
}

export class CheckSettingsFluent<TElement = unknown, TSelector = unknown> {
  /** @internal */
  static window(): CheckSettingsFluent {
    return new this()
  }
  /** @internal */
  static region(region: unknown): CheckSettingsFluent {
    return new this().region(region)
  }
  /** @internal */
  static frame(contextOrFrame: unknown, scrollRootElement?: unknown): CheckSettingsFluent {
    return new this().frame(contextOrFrame, scrollRootElement)
  }
  /** @internal */
  static shadow(selector: unknown): CheckSettingsFluent {
    return new this().shadow(selector)
  }

  protected static readonly _spec: CheckSettingsSpec<any, any>

  private _spec: CheckSettingsSpec<TElement, TSelector>

  private _settings: CheckSettings<TElement, TSelector> = {}

  private _isFrameReference(value: any): value is FrameReference<TSelector, TElement> {
    return utils.types.isNumber(value) || utils.types.isString(value) || this._isElementReference(value)
  }

  private _isRegionReference(value: any): value is RegionReference<TSelector, TElement> {
    return utils.types.has(value, ['x', 'y', 'width', 'height']) || this._isElementReference(value)
  }

  private _isElementReference(value: any): value is ElementReference<TSelector, TElement> {
    const spec = this._spec ?? ((this.constructor as typeof CheckSettingsFluent)._spec as typeof this._spec)
    return spec.isElement(value) || this._isSelectorReference(value)
  }

  private _isSelectorReference(selector: any): selector is SelectorReference<TSelector> {
    const spec = this._spec ?? ((this.constructor as typeof CheckSettingsFluent)._spec as typeof this._spec)
    return (
      spec.isSelector(selector) ||
      utils.types.isString(selector) ||
      (utils.types.isPlainObject(selector) &&
        utils.types.has(selector, 'selector') &&
        (utils.types.isString(selector.selector) || spec.isSelector(selector.selector)))
    )
  }

  constructor(
    settings?: CheckSettings<TElement, TSelector> | CheckSettingsFluent<TElement, TSelector>,
    spec?: CheckSettingsSpec<TElement, TSelector>,
  ) {
    if (!settings) return this
    if (utils.types.instanceOf(settings, CheckSettingsFluent)) return settings

    this._spec = spec

    if (settings.name) this.name(settings.name)
    if (settings.region) this.region(settings.region)
    if (settings.scrollRootElement) this.scrollRootElement(settings.scrollRootElement)
    if (settings.frames) {
      settings.frames.forEach(reference => {
        if (utils.types.isNull(reference)) return
        if (utils.types.has(reference, 'frame')) {
          this.frame(reference.frame, reference.scrollRootElement)
        } else {
          this.frame(reference)
        }
      })
    }
    if (!utils.types.isNull(settings.fully)) this.fully(settings.fully)
    if (settings.matchLevel) this.matchLevel(settings.matchLevel as MatchLevelEnum)
    if (!utils.types.isNull(settings.useDom)) this.useDom(settings.useDom)
    if (!utils.types.isNull(settings.sendDom)) this.sendDom(settings.sendDom)
    if (!utils.types.isNull(settings.enablePatterns)) this.enablePatterns(settings.enablePatterns)
    if (!utils.types.isNull(settings.ignoreDisplacements)) this.ignoreDisplacements(settings.ignoreDisplacements)
    if (!utils.types.isNull(settings.ignoreCaret)) this.ignoreCaret(settings.ignoreCaret)
    if (settings.ignoreRegions) {
      settings.ignoreRegions.forEach(ignoreRegion => this.ignoreRegion(ignoreRegion))
    }
    if (settings.layoutRegions) {
      settings.layoutRegions.forEach(layoutRegion => this.layoutRegion(layoutRegion))
    }
    if (settings.strictRegions) {
      settings.strictRegions.forEach(strictRegion => this.strictRegion(strictRegion))
    }
    if (settings.contentRegions) {
      settings.contentRegions.forEach(contentRegion => this.contentRegion(contentRegion))
    }
    if (settings.floatingRegions) {
      settings.floatingRegions.forEach(floatingRegion =>
        this.floatingRegion(floatingRegion as FloatingRegionReference<TElement, TSelector>),
      )
    }
    if (settings.accessibilityRegions) {
      settings.accessibilityRegions.forEach(accessibilityRegion =>
        this.accessibilityRegion(accessibilityRegion as AccessibilityRegionReference<TElement, TSelector>),
      )
    }
    if (!utils.types.isNull(settings.disableBrowserFetching))
      this.disableBrowserFetching(settings.disableBrowserFetching)
    if (!utils.types.isNull(settings.layoutBreakpoints)) this.layoutBreakpoints(settings.layoutBreakpoints)
    if (settings.hooks) {
      Object.entries(settings.hooks).forEach(([name, script]) => this.hook(name, script))
    }
    if (settings.visualGridOptions) {
      Object.entries(settings.visualGridOptions).forEach(([key, value]) => this.visualGridOption(key, value))
    }
    if (settings.renderId) this.renderId(settings.renderId)
    if (settings.pageId) this.pageId(settings.pageId)
    if (settings.variationGroupId) this.variationGroupId(settings.variationGroupId)
    if (!utils.types.isNull(settings.timeout)) this.timeout(settings.timeout)
    if (!utils.types.isNull(settings.waitBeforeCapture)) this.waitBeforeCapture(settings.waitBeforeCapture)
    if (!utils.types.isNull(settings.lazyLoad)) this.lazyLoad(settings.lazyLoad)
  }

  /** @undocumented */
  name(name: string): this {
    utils.guard.isString(name, {name: 'name'})
    this._settings.name = name
    return this
  }
  withName(name: string) {
    return this.name(name)
  }

  region(region: RegionReference<TElement, TSelector> | LegacyRegion): this {
    if (utils.types.has(region, ['left', 'top', 'width', 'height'])) {
      region = {x: region.left, y: region.top, width: region.width, height: region.height}
    }
    utils.guard.custom(region, value => this._isRegionReference(value), {name: 'region'})

    if (
      this._isSelectorReference(region) &&
      this._isSelectorReference(this._settings.region) &&
      utils.types.has(this._settings.region, 'selector')
    ) {
      let lastSelector: any = this._settings.region
      while (lastSelector.shadow) lastSelector = lastSelector.shadow
      lastSelector.shadow = region
    } else {
      this._settings.region = region
    }

    return this
  }

  shadow(selector: SelectorReference<TSelector>): this {
    utils.guard.custom(selector, value => this._isSelectorReference(value), {name: 'selector'})

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
    const context = utils.types.has(contextOrFrame, 'frame')
      ? contextOrFrame
      : {frame: contextOrFrame, scrollRootElement}
    if (!this._settings.frames) this._settings.frames = []
    utils.guard.custom(context.frame, value => this._isFrameReference(value), {name: 'frame'})
    utils.guard.custom(context.scrollRootElement, value => this._isElementReference(value), {
      name: 'scrollRootElement',
      strict: false,
    })
    this._settings.frames.push(context)
    return this
  }

  ignoreRegion(
    region: RegionReference<TElement, TSelector> | CodedRegionReference<TElement, TSelector> | LegacyRegion,
  ): this {
    if (!this._settings.ignoreRegions) this._settings.ignoreRegions = []
    if (utils.types.has(region, ['left', 'top', 'width', 'height'])) {
      region = {x: region.left, y: region.top, width: region.width, height: region.height}
    }
    this._settings.ignoreRegions.push(region)
    return this
  }
  ignoreRegions(
    ...regions: (RegionReference<TElement, TSelector> | CodedRegionReference<TElement, TSelector> | LegacyRegion)[]
  ): this {
    regions.forEach(region => this.ignoreRegion(region))
    return this
  }
  /** @deprecated */
  ignore(region: RegionReference<TElement, TSelector> | LegacyRegion) {
    return this.ignoreRegion(region)
  }
  /** @deprecated */
  ignores(...regions: (RegionReference<TElement, TSelector> | LegacyRegion)[]): this {
    return this.ignoreRegions(...regions)
  }

  layoutRegion(
    region: RegionReference<TElement, TSelector> | CodedRegionReference<TElement, TSelector> | LegacyRegion,
  ): this {
    if (!this._settings.layoutRegions) this._settings.layoutRegions = []
    if (utils.types.has(region, ['left', 'top', 'width', 'height'])) {
      region = {x: region.left, y: region.top, width: region.width, height: region.height}
    }
    this._settings.layoutRegions.push(region)
    return this
  }
  layoutRegions(
    ...regions: (RegionReference<TElement, TSelector> | CodedRegionReference<TElement, TSelector> | LegacyRegion)[]
  ): this {
    regions.forEach(region => this.layoutRegion(region))
    return this
  }

  strictRegion(
    region: RegionReference<TElement, TSelector> | CodedRegionReference<TElement, TSelector> | LegacyRegion,
  ): this {
    if (!this._settings.strictRegions) this._settings.strictRegions = []
    if (utils.types.has(region, ['left', 'top', 'width', 'height'])) {
      region = {x: region.left, y: region.top, width: region.width, height: region.height}
    }
    this._settings.strictRegions.push(region)
    return this
  }
  strictRegions(
    ...regions: (RegionReference<TElement, TSelector> | CodedRegionReference<TElement, TSelector> | LegacyRegion)[]
  ): this {
    regions.forEach(region => this.strictRegion(region))
    return this
  }

  contentRegion(
    region: RegionReference<TElement, TSelector> | CodedRegionReference<TElement, TSelector> | LegacyRegion,
  ): this {
    if (!this._settings.contentRegions) this._settings.contentRegions = []
    if (utils.types.has(region, ['left', 'top', 'width', 'height'])) {
      region = {x: region.left, y: region.top, width: region.width, height: region.height}
    }
    this._settings.contentRegions.push(region)
    return this
  }
  contentRegions(
    ...regions: (RegionReference<TElement, TSelector> | CodedRegionReference<TElement, TSelector> | LegacyRegion)[]
  ): this {
    regions.forEach(region => this.contentRegion(region))
    return this
  }

  floatingRegion(region: FloatingRegionReference<TElement, TSelector>): this
  floatingRegion(region: LegacyFloatingRegionReference<TElement, TSelector>): this
  floatingRegion(
    region: RegionReference<TElement, TSelector> | LegacyRegion,
    maxUpOffset?: number,
    maxDownOffset?: number,
    maxLeftOffset?: number,
    maxRightOffset?: number,
  ): this
  floatingRegion(
    region:
      | FloatingRegionReference<TElement, TSelector>
      | LegacyFloatingRegionReference<TElement, TSelector>
      | RegionReference<TElement, TSelector>
      | LegacyRegion,
    maxUpOffset?: number,
    maxDownOffset?: number,
    maxLeftOffset?: number,
    maxRightOffset?: number,
  ): this {
    if (utils.types.has(region, ['left', 'top', 'width', 'height'])) {
      region = {x: region.left, y: region.top, width: region.width, height: region.height}
    }

    let floatingRegion: FloatingRegionReference<TElement, TSelector>
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

    utils.guard.custom(floatingRegion.region, value => this._isRegionReference(value), {
      name: 'region',
    })
    utils.guard.isNumber(floatingRegion.offset.top, {name: 'maxUpOffset'})
    utils.guard.isNumber(floatingRegion.offset.bottom, {name: 'maxDownOffset'})
    utils.guard.isNumber(floatingRegion.offset.left, {name: 'maxLeftOffset'})
    utils.guard.isNumber(floatingRegion.offset.right, {name: 'maxRightOffset'})
    if (!this._settings.floatingRegions) this._settings.floatingRegions = []
    this._settings.floatingRegions.push(floatingRegion)
    return this
  }
  floatingRegions(
    ...regions: (FloatingRegionReference<TElement, TSelector> | RegionReference<TElement, TSelector> | LegacyRegion)[]
  ): this
  floatingRegions(maxOffset: number, ...regions: (RegionReference<TElement, TSelector> | LegacyRegion)[]): this
  floatingRegions(
    regionOrMaxOffset:
      | FloatingRegionReference<TElement, TSelector>
      | RegionReference<TElement, TSelector>
      | LegacyRegion
      | number,
    ...regions: (FloatingRegionReference<TElement, TSelector> | RegionReference<TElement, TSelector> | LegacyRegion)[]
  ): this {
    let maxOffset: number
    if (utils.types.isNumber(regionOrMaxOffset)) {
      maxOffset = regionOrMaxOffset
    } else {
      this.floatingRegion(regionOrMaxOffset as FloatingRegionReference<TElement, TSelector>)
    }
    regions.forEach(region => {
      if (utils.types.has(region, 'region')) this.floatingRegion(region)
      else this.floatingRegion(region, maxOffset, maxOffset, maxOffset, maxOffset)
    })
    return this
  }
  /** @deprecated */
  floating(region: FloatingRegionReference<TElement, TSelector>): this
  /** @deprecated */
  floating(region: RegionReference<TElement, TSelector> | LegacyRegion): this
  floating(
    region: FloatingRegionReference<TElement, TSelector> | RegionReference<TElement, TSelector> | LegacyRegion,
    maxUpOffset?: number,
    maxDownOffset?: number,
    maxLeftOffset?: number,
    maxRightOffset?: number,
  ): this {
    if (utils.types.has(region, 'region')) return this.floatingRegion(region)
    else return this.floatingRegion(region, maxUpOffset, maxDownOffset, maxLeftOffset, maxRightOffset)
  }
  /** @deprecated */
  floatings(
    ...regions: (FloatingRegionReference<TElement, TSelector> | RegionReference<TElement, TSelector> | LegacyRegion)[]
  ): this
  /** @deprecated */
  floatings(maxOffset: number, ...regions: (RegionReference<TElement, TSelector> | LegacyRegion)[]): this
  floatings(
    regionOrMaxOffset:
      | FloatingRegionReference<TElement, TSelector>
      | RegionReference<TElement, TSelector>
      | LegacyRegion
      | number,
    ...regions: (FloatingRegionReference<TElement, TSelector> | RegionReference<TElement, TSelector> | LegacyRegion)[]
  ): this {
    return this.floatingRegions(regionOrMaxOffset as number, ...(regions as RegionReference<TElement, TSelector>[]))
  }

  accessibilityRegion(region: AccessibilityRegionReference<TElement, TSelector>): this
  accessibilityRegion(region: RegionReference<TElement, TSelector> | LegacyRegion, type?: AccessibilityRegionType): this
  accessibilityRegion(
    region: AccessibilityRegionReference<TElement, TSelector> | RegionReference<TElement, TSelector> | LegacyRegion,
    type?: AccessibilityRegionType,
  ): this {
    if (utils.types.has(region, ['left', 'top', 'width', 'height'])) {
      region = {x: region.left, y: region.top, width: region.width, height: region.height}
    }
    const accessibilityRegion = utils.types.has(region, 'region') ? region : {region, type}
    utils.guard.custom(accessibilityRegion.region, value => this._isRegionReference(value), {
      name: 'region',
    })
    utils.guard.isEnumValue(accessibilityRegion.type, AccessibilityRegionTypeEnum, {
      name: 'type',
      strict: false,
    })
    if (!this._settings.accessibilityRegions) this._settings.accessibilityRegions = []
    this._settings.accessibilityRegions.push(accessibilityRegion)
    return this
  }
  accessibilityRegions(
    ...regions: (
      | AccessibilityRegionReference<TElement, TSelector>
      | RegionReference<TElement, TSelector>
      | LegacyRegion
    )[]
  ): this
  accessibilityRegions(
    type: AccessibilityRegionType,
    ...regions: (RegionReference<TElement, TSelector> | LegacyRegion)[]
  ): this
  accessibilityRegions(
    regionOrType:
      | AccessibilityRegionReference<TElement, TSelector>
      | RegionReference<TElement, TSelector>
      | LegacyRegion
      | AccessibilityRegionType,
    ...regions: (
      | AccessibilityRegionReference<TElement, TSelector>
      | RegionReference<TElement, TSelector>
      | LegacyRegion
    )[]
  ): this {
    let type: AccessibilityRegionType
    if (utils.types.isEnumValue(regionOrType, AccessibilityRegionTypeEnum)) {
      type = regionOrType
    } else {
      this.accessibilityRegion(regionOrType as AccessibilityRegionReference<TElement, TSelector>)
    }
    regions.forEach(region => {
      if (utils.types.has(region, 'region')) this.accessibilityRegion(region)
      else this.accessibilityRegion(region, type)
    })
    return this
  }

  scrollRootElement(scrollRootElement: ElementReference<TElement, TSelector>): this {
    utils.guard.custom(scrollRootElement, value => this._isElementReference(value), {
      name: 'scrollRootElement',
    })
    if (this._settings.frames && this._settings.frames.length > 0) {
      const context = this._settings.frames[this._settings.frames.length - 1] as ContextReference<TElement, TSelector>
      context.scrollRootElement = scrollRootElement
    }
    this._settings.scrollRootElement = scrollRootElement
    return this
  }

  fully(fully = true): this {
    utils.guard.isBoolean(fully, {name: 'fully'})
    this._settings.fully = fully
    return this
  }

  /** @deprecated */
  stitchContent(stitchContent = true) {
    return this.fully(stitchContent)
  }

  matchLevel(matchLevel: MatchLevel): this {
    utils.guard.isEnumValue(matchLevel, MatchLevelEnum, {name: 'matchLevel'})
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

  useDom(useDom = true): this {
    utils.guard.isBoolean(useDom, {name: 'useDom'})
    this._settings.useDom = useDom
    return this
  }

  sendDom(sendDom = true): this {
    utils.guard.isBoolean(sendDom, {name: 'sendDom'})
    this._settings.sendDom = sendDom
    return this
  }

  enablePatterns(enablePatterns = true): this {
    utils.guard.isBoolean(enablePatterns, {name: 'enablePatterns'})
    this._settings.enablePatterns = enablePatterns
    return this
  }

  ignoreDisplacements(ignoreDisplacements = true): this {
    utils.guard.isBoolean(ignoreDisplacements, {name: 'ignoreDisplacements'})
    this._settings.ignoreDisplacements = ignoreDisplacements
    return this
  }

  ignoreCaret(ignoreCaret = true): this {
    utils.guard.isBoolean(ignoreCaret, {name: 'ignoreCaret'})
    this._settings.ignoreCaret = ignoreCaret
    return this
  }

  disableBrowserFetching(disableBrowserFetching: boolean): this {
    utils.guard.isBoolean(disableBrowserFetching, {name: 'disableBrowserFetching'})
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
    utils.guard.isString(renderId, {name: 'renderId'})
    this._settings.renderId = renderId
    return this
  }

  pageId(pageId: string): this {
    utils.guard.isString(pageId, {name: 'pageId'})
    this._settings.pageId = pageId
    return this
  }

  variationGroupId(variationGroupId: string): this {
    utils.guard.isString(variationGroupId, {name: 'variationGroupId'})
    this._settings.variationGroupId = variationGroupId
    return this
  }

  timeout(timeout: number): this {
    utils.guard.isNumber(timeout, {name: 'timeout'})
    this._settings.timeout = timeout
    return this
  }

  waitBeforeCapture(waitBeforeCapture: number): this {
    utils.guard.isNumber(waitBeforeCapture, {name: 'waitBeforeCapture'})
    this._settings.waitBeforeCapture = waitBeforeCapture
    return this
  }

  lazyLoad(options?: LazyLoadOptions | boolean): this {
    this._settings.lazyLoad = options ?? true
    return this
  }

  /** @internal */
  toObject(): CheckSettings<TElement, TSelector> {
    return this._settings
  }

  /** @internal */
  toJSON(): types.CheckSettings<TElement, TSelector, 'classic' | 'ufg'> {
    return dropUndefinedProperties({
      name: this._settings.name,
      region: this._settings.region,
      frames: this._settings.frames,
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
      floatingRegions: this._settings.floatingRegions,
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
    })
  }

  /** @internal */
  toString(): string {
    return utils.general.toString(this)
  }
}

function dropUndefinedProperties(object: Record<string, any>) {
  return Object.entries(object).reduce(
    (object, [key, value]) => (value !== undefined ? Object.assign(object, {[key]: value}) : object),
    {} as any,
  )
}
