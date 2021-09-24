import type * as types from '@applitools/types'
import type {Context} from './context'
import type {SpecUtils} from './utils'
import * as utils from '@applitools/utils'
import {makeSpecUtils} from './utils'

const snippets = require('@applitools/snippets')

export type ElementState = {
  contentSize?: types.Size
  scrollOffset?: types.Location
  transforms?: any
}

export class Element<TDriver, TContext, TElement, TSelector> {
  private _target: TElement

  private _context: Context<TDriver, TContext, TElement, TSelector>
  private _selector: types.Selector<TSelector>
  private _index: number
  private _state: ElementState = {}
  private _originalOverflow: any
  private _touchPadding: number
  private _logger: any
  private _utils: SpecUtils<TDriver, TContext, TElement, TSelector>

  protected readonly _spec: types.SpecDriver<TDriver, TContext, TElement, TSelector>

  constructor(options: {
    spec: types.SpecDriver<TDriver, TContext, TElement, TSelector>
    element?: TElement | Element<TDriver, TContext, TElement, TSelector>
    context?: Context<TDriver, TContext, TElement, TSelector>
    selector?: types.Selector<TSelector>
    index?: number
    logger?: any
  }) {
    if (options.element instanceof Element) return options.element

    this._spec = options.spec
    this._utils = makeSpecUtils(options.spec)

    if (options.context) this._context = options.context
    if (options.logger) this._logger = options.logger

    if (this._spec.isElement(options.element)) {
      this._target = this._spec.transformElement?.(options.element) ?? options.element
      // Some frameworks contains information about the selector inside an element
      this._selector = options.selector ?? this._spec.extractSelector?.(options.element)
      this._index = options.index
    } else if (this._utils.isSelector(options.selector)) {
      this._selector = options.selector
    } else {
      throw new TypeError('Element constructor called with argument of unknown type!')
    }
  }

  get target() {
    return this._target
  }

  get selector() {
    return this._selector
  }

  get context() {
    return this._context
  }

  get driver() {
    return this.context.driver
  }

  get isRef() {
    return this.context.isRef || !this.target
  }

  async equals(element: Element<TDriver, TContext, TElement, TSelector> | TElement): Promise<boolean> {
    if (this.isRef) return false

    element = element instanceof Element ? element.target : element
    if (this.driver.isWeb) {
      return this._spec
        .executeScript(this.context.target, snippets.isEqualElements, [this.target, element])
        .catch(() => false)
    } else {
      return this._spec.isEqualElements(this.context.target, this.target, element)
    }
  }

  async init(context: Context<TDriver, TContext, TElement, TSelector>): Promise<this> {
    this._context = context
    this._logger = (context as any)._logger
    if (this._target) return this

    if (this._selector) {
      const element = await this._context.element(this._selector)
      if (!element) throw new Error(`Cannot find element with selector ${JSON.stringify(this._selector)}`)
      this._target = element.target
      return this
    }
  }

  async getRegion(): Promise<types.Region> {
    const region = await this.withRefresh(async () => {
      if (this.driver.isWeb) {
        this._logger.log('Extracting region of web element with selector', this.selector)
        return this.context.execute(snippets.getElementRect, [this, false])
      } else {
        this._logger.log('Extracting region of native element with selector', this.selector)
        const region = await this._spec.getElementRegion(this.driver.target, this.target)
        this._logger.log('Extracted native region', region)
        return this.driver.normalizeRegion(region)
      }
    })
    this._logger.log('Extracted region', region)
    return region
  }

  async getClientRegion(): Promise<types.Region> {
    const region = await this.withRefresh(async () => {
      if (this.driver.isWeb) {
        this._logger.log('Extracting region of web element with selector', this.selector)
        return this.context.execute(snippets.getElementRect, [this, true])
      } else {
        this._logger.log('Extracting region of native element with selector', this.selector)
        const region = await this._spec.getElementRegion(this.driver.target, this.target)
        this._logger.log('Extracted native region', region)
        return this.driver.normalizeRegion(region)
      }
    })
    this._logger.log('Extracted client region', region)
    return region
  }

  async getContentSize(): Promise<types.Size> {
    if (this._state.contentSize) return this._state.contentSize

    const size = await this.withRefresh(async () => {
      if (this.driver.isWeb) {
        this._logger.log('Extracting content size of web element with selector', this.selector)
        return this.context.execute(snippets.getElementContentSize, [this])
      } else {
        this._logger.log('Extracting content size of native element with selector', this.selector)
        try {
          if (this.driver.isAndroid) {
            const className = await this.getAttribute('className')
            if (
              [
                'android.widget.ListView',
                'android.widget.GridView',
                'android.support.v7.widget.RecyclerView',
                // 'androidx.recyclerview.widget.RecyclerView',
                'androidx.viewpager2.widget.ViewPager2',
              ].includes(className)
            ) {
              this._logger.log('Trying to extract content size using android helper library')
              const helperElement = await this.driver.element({
                type: '-android uiautomator',
                selector: 'new UiSelector().description("EyesAppiumHelper")',
              })
              if (helperElement) {
                const elementRegion = await this._spec.getElementRegion(this.driver.target, this.target)
                await helperElement.click()
                const info = await this._spec.getElementText(this.driver.target, helperElement.target)
                this._state.contentSize = utils.geometry.scale(
                  {width: elementRegion.width, height: Number(info)},
                  1 / this.driver.pixelRatio,
                )
              } else {
                this._logger.log('Helper library for android was not detected')
              }
            }
          } else if (this.driver.isIOS) {
            const type = await this.getAttribute('type')
            if (type === 'XCUIElementTypeScrollView') {
              const elementRegion = await this._spec.getElementRegion(this.driver.target, this.target)
              const [childElement] = await this.driver.elements({
                type: 'xpath',
                selector: '//XCUIElementTypeScrollView[1]/*', // We cannot be sure that our element is the first one
              })
              const childElementRegion = await this._spec.getElementRegion(this.driver.target, childElement.target)
              this._state.contentSize = {
                width: elementRegion.width,
                height: childElementRegion.y + childElementRegion.height - elementRegion.y,
              }
            } else if (type === 'XCUIElementTypeCollectionView') {
              this._logger.log('Trying to extract content size using ios helper library')
              const helperElement = await this.driver.element({
                type: 'name',
                selector: 'applitools_grab_scrollable_data_button',
              })
              if (helperElement) {
                const helperElementRegion = await this._spec.getElementRegion(this.driver.target, helperElement.target)
                await this._spec.performAction(this.driver.target, [
                  {action: 'tap', x: helperElementRegion.x, y: helperElementRegion.y},
                  {action: 'wait', ms: 1000},
                  {action: 'release'},
                ])
                const infoElement = await this.driver.element({type: 'name', selector: 'applitools_content_size_label'})
                const info = await this._spec.getElementText(this.driver.target, infoElement.target)
                if (info) {
                  const [_, width, height] = info.match(/\{(\d+),\s?(\d+)\}/)
                  this._state.contentSize = {width: Number(width), height: Number(height)}
                }
              } else {
                this._logger.log('Helper library for ios was not detected')
              }
            }
          }

          if (!this._state.contentSize) {
            const data = JSON.parse(await this.getAttribute('contentSize'))
            this._logger.log('Extracted native content size attribute', data)
            this._state.contentSize = this.driver.isIOS
              ? {width: data.width, height: data.scrollableOffset}
              : utils.geometry.scale(
                  {width: data.width, height: data.height + data.scrollableOffset},
                  1 / this.driver.pixelRatio,
                )
            this._touchPadding = data.touchPadding ?? this._touchPadding
          }

          if (this.driver.isAndroid) {
            this._logger.log('Stabilizing android scroll offset')

            // android has a bug when after extracting 'contentSize' attribute the element is being scrolled by undetermined number of pixels
            const originalScrollOffset = await this.getScrollOffset()
            this._state.scrollOffset = {x: -1, y: -1}
            await this.scrollTo({x: 0, y: 0})
            await this.scrollTo(originalScrollOffset)
          }

          return this._state.contentSize
        } catch (err) {
          this._logger.warn('Failed to extract content size, extracting client size instead')
          this._logger.error(err)
          return utils.geometry.size(await this.getClientRegion())
        }
      }
    })

    this._logger.log('Extracted content size', size)
    return size
  }

  async isScrollable(): Promise<boolean> {
    this._logger.log('Check is element with selector', this.selector, 'is scrollable')
    const isScrollable = await this.withRefresh(async () => {
      if (this.driver.isWeb) {
        return this.context.execute(snippets.isElementScrollable, [this])
      } else if (this.driver.isAndroid) {
        const data = JSON.parse(await this.getAttribute('scrollable'))
        return Boolean(data) || false
      } else if (this.driver.isIOS) {
        const type = await this.getAttribute('type')
        return ['XCUIElementTypeScrollView', 'XCUIElementTypeTable', 'XCUIElementTypeCollectionView'].includes(type)
      }
    })
    this._logger.log('Element is scrollable', isScrollable)
    return isScrollable
  }

  async isRoot(): Promise<boolean> {
    // TODO replace with snippet
    return this.withRefresh(async () => {
      if (this.driver.isWeb) {
        const rootElement = await this.context.element({type: 'css', selector: 'html'})
        return this.equals(rootElement)
      } else {
        return false
      }
    })
  }

  async getTouchPadding(): Promise<number> {
    if (this._touchPadding == null) {
      if (this.driver.isWeb) this._touchPadding = 0
      else if (this.driver.isIOS) this._touchPadding = 14
      else if (this.driver.isAndroid) {
        const {touchPadding} = JSON.parse(await this.getAttribute('contentSize'))
        this._touchPadding = touchPadding ?? 0
      }
    }
    return this._touchPadding
  }

  async getAttribute(name: string): Promise<string> {
    if (this.driver.isWeb) {
      const properties = await this.context.execute(snippets.getElementProperties, [this, [name]])
      return properties[name]
    } else {
      return this._spec.getElementAttribute(this.driver.target, this.target, name)
    }
  }

  async setAttribute(name: string, value: string): Promise<void> {
    if (this.driver.isWeb) {
      await this.context.execute(snippets.setElementAttributes, [this, {[name]: value}])
    }
  }

  async scrollTo(offset: types.Location): Promise<types.Location> {
    return this.withRefresh(async () => {
      offset = {x: Math.round(offset.x), y: Math.round(offset.y)}
      if (this.driver.isWeb) {
        let actualOffset = await this.context.execute(snippets.scrollTo, [this, offset])
        // iOS has an issue when scroll offset is read immediately after it is been set it will always return the exact value that was set
        if (this.driver.isIOS) actualOffset = await this.getScrollOffset()
        return actualOffset
      } else {
        const currentScrollOffset = await this.getScrollOffset()
        if (utils.geometry.equals(offset, currentScrollOffset)) return currentScrollOffset

        const contentSize = await this.getContentSize()
        const scrollableRegion = await this._spec.getElementRegion(this.driver.target, this.target)
        const scaledScrollableRegion = this.driver.isAndroid
          ? utils.geometry.scale(scrollableRegion, 1 / this.driver.pixelRatio)
          : scrollableRegion
        const maxOffset = {
          x: Math.round(scaledScrollableRegion.width * (contentSize.width / scaledScrollableRegion.width - 1)),
          y: Math.round(scaledScrollableRegion.height * (contentSize.height / scaledScrollableRegion.height - 1)),
        }
        let requiredOffset
        let remainingOffset
        if (offset.x === 0 && offset.y === 0) {
          requiredOffset = offset
          remainingOffset = {x: -maxOffset.x, y: -maxOffset.y}
        } else {
          requiredOffset = {x: Math.min(offset.x, maxOffset.x), y: Math.min(offset.y, maxOffset.y)}
          remainingOffset = utils.geometry.offsetNegative(requiredOffset, currentScrollOffset)
        }

        if (this.driver.isAndroid) {
          remainingOffset = utils.geometry.scale(remainingOffset, this.driver.pixelRatio)
        }

        const actions = []

        const xPadding = Math.floor(scrollableRegion.width * 0.1)
        const yCenter = Math.floor(scrollableRegion.y + scrollableRegion.height / 2)
        const xLeft = scrollableRegion.y + xPadding
        const xDirection = remainingOffset.y > 0 ? 'right' : 'left'
        let xRemaining = Math.abs(remainingOffset.x)
        while (xRemaining > 0) {
          const xRight = scrollableRegion.x + Math.min(xRemaining + xPadding, scrollableRegion.width - xPadding)
          const [xStart, xEnd] = xDirection === 'right' ? [xRight, xLeft] : [xLeft, xRight]
          actions.push(
            {action: 'press', x: xStart, y: yCenter},
            {action: 'wait', ms: 1500},
            {action: 'moveTo', x: xEnd, y: yCenter},
            {action: 'release'},
          )
          xRemaining -= xRight - xLeft
        }

        const yPadding = Math.floor(scrollableRegion.height * 0.1)
        const xCenter = Math.floor(scrollableRegion.x + scrollableRegion.width / 2) // 0
        const yTop = scrollableRegion.y + yPadding
        const yDirection = remainingOffset.y > 0 ? 'down' : 'up'
        let yRemaining = Math.abs(remainingOffset.y) + (await this.getTouchPadding()) * 2
        while (yRemaining > 0) {
          const yBottom = scrollableRegion.y + Math.min(yRemaining + yPadding, scrollableRegion.height - yPadding)
          const [yStart, yEnd] = yDirection === 'down' ? [yBottom, yTop] : [yTop, yBottom]
          actions.push(
            {action: 'press', x: xCenter, y: yStart},
            {action: 'wait', ms: 1500},
            {action: 'moveTo', x: xCenter, y: yEnd},
            {action: 'wait', ms: 1500},
            {action: 'release'},
          )
          yRemaining -= yBottom - yTop
        }

        if (actions.length > 0) {
          await this._spec.performAction(this.driver.target, actions)
        }

        this._state.scrollOffset = requiredOffset
        return this._state.scrollOffset
      }
    })
  }

  async translateTo(offset: types.Location): Promise<types.Location> {
    offset = {x: Math.round(offset.x), y: Math.round(offset.y)}
    if (this.driver.isWeb) {
      return this.withRefresh(async () => this.context.execute(snippets.translateTo, [this, offset]))
    } else {
      throw new Error('Cannot apply css translate scrolling on non-web element')
    }
  }

  async getScrollOffset(): Promise<types.Location> {
    if (this.driver.isWeb) {
      return this.withRefresh(() => this.context.execute(snippets.getElementScrollOffset, [this]))
    } else {
      return this._state.scrollOffset ?? {x: 0, y: 0}
    }
  }

  async getTranslateOffset(): Promise<types.Location> {
    if (this.driver.isWeb) {
      return this.withRefresh(() => this.context.execute(snippets.getElementTranslateOffset, [this]))
    } else {
      throw new Error('Cannot apply css translate scrolling on non-web element')
    }
  }

  async getInnerOffset(): Promise<types.Location> {
    if (this.driver.isWeb) {
      return this.withRefresh(() => this.context.execute(snippets.getElementInnerOffset, [this]))
    } else {
      return this.getScrollOffset()
    }
  }

  async click(): Promise<void> {
    await this._spec.click(this.context.target, this.target)
  }

  async preserveState(): Promise<ElementState> {
    if (this.driver.isNative) return
    // TODO create single js snippet
    const scrollOffset = await this.getScrollOffset()
    const transforms = await this.context.execute(snippets.getElementStyleProperties, [
      this,
      ['transform', '-webkit-transform'],
    ])
    if (!utils.types.has(this._state, ['scrollOffset', 'transforms'])) {
      this._state.scrollOffset = scrollOffset
      this._state.transforms = transforms
    }
    return {scrollOffset, transforms}
  }

  async restoreState(state: ElementState = this._state): Promise<void> {
    if (this.driver.isNative) return
    if (state.scrollOffset) await this.scrollTo(state.scrollOffset)
    if (state.transforms) await this.context.execute(snippets.setElementStyleProperties, [this, state.transforms])
    if (state === this._state) {
      this._state.scrollOffset = null
      this._state.transforms = null
    }
  }

  async hideScrollbars(): Promise<void> {
    if (this.driver.isNative) return
    if (this._originalOverflow) return
    return this.withRefresh(async () => {
      const {overflow} = await this.context.execute(snippets.setElementStyleProperties, [this, {overflow: 'hidden'}])
      this._originalOverflow = overflow
    })
  }

  async restoreScrollbars(): Promise<void> {
    if (this.driver.isNative) return
    if (!this._originalOverflow) return
    return this.withRefresh(async () => {
      await this.context.execute(snippets.setElementStyleProperties, [this, {overflow: this._originalOverflow}])
      this._originalOverflow = null
    })
  }

  async refresh(freshElement?: TElement): Promise<boolean> {
    if (this._spec.isElement(freshElement)) {
      this._target = freshElement
      return true
    }
    if (!this._selector) return false
    const element =
      this._index > 0
        ? await this.context.elements(this._selector).then(elements => elements[this._index])
        : await this.context.element(this._selector)
    if (element) {
      this._target = element.target
    }
    return Boolean(element)
  }

  async withRefresh<TResult>(operation: (...args: any[]) => TResult): Promise<TResult> {
    if (!this._spec.isStaleElementError) return operation()
    try {
      const result = await operation()
      // Some frameworks could handle stale element reference error by itself or doesn't throw an error
      if (this._spec.isStaleElementError(result, this.selector as TSelector)) {
        await this.refresh()
        return operation()
      }
      return result
    } catch (err) {
      if (this._spec.isStaleElementError(err)) {
        const refreshed = await this.refresh()
        if (refreshed) return operation()
      }
      throw err
    }
  }

  toJSON(): TElement {
    return this.target
  }
}
