import type * as types from '@applitools/types'
import type {Context} from './context'
import * as utils from '@applitools/utils'
import * as specUtils from './spec-utils'

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

  protected readonly _spec: types.SpecDriver<TDriver, TContext, TElement, TSelector>

  constructor(options: {
    spec: types.SpecDriver<TDriver, TContext, TElement, TSelector>
    element?: TElement | Element<TDriver, TContext, TElement, TSelector>
    context?: Context<TDriver, TContext, TElement, TSelector>
    selector?: types.Selector<TSelector>
    index?: number
    logger?: any
    root?: TElement
  }) {
    if (options.element instanceof Element) return options.element

    this._spec = options.spec

    if (options.context) this._context = options.context
    if (options.logger) this._logger = options.logger

    if (this._spec.isElement(options.element)) {
      let elementToUse = options.element
      if (options.root) {
        elementToUse = options.root
        this._target = elementToUse
      } else {
        this._target = this._spec.transformElement?.(elementToUse) ?? elementToUse
      }

      // Some frameworks contains information about the selector inside an element
      this._selector = options.selector ?? this._spec.extractSelector?.(elementToUse)
      this._index = options.index
    } else if (specUtils.isSelector(this._spec, options.selector)) {
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

  async getRegion(shouldIgnoreSafeRegion?: boolean): Promise<types.Region> {
    const region = await this.withRefresh(async () => {
      if (this.driver.isWeb) {
        this._logger.log('Extracting region of web element with selector', this.selector)
        return this.context.execute(snippets.getElementRect, [this, false])
      } else {
        this._logger.log('Extracting region of native element with selector', this.selector)
        const region = await this._spec.getElementRegion(this.driver.target, this.target)
        this._logger.log('Extracted native region', region)
        return this.driver.normalizeRegion(region, shouldIgnoreSafeRegion)
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
        return this.getRegion()
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
          const {touchPadding, ...contentRegion}: any = await this.getAttribute('contentSize')
            .then(data => {
              const contentSize = JSON.parse(data)
              return {
                touchPadding: contentSize.touchPadding,
                x: contentSize.left,
                y: contentSize.top,
                width: contentSize.width,
                height: (this.driver.isAndroid ? contentSize.height : 0) + contentSize.scrollableOffset,
              }
            })
            .catch(err => {
              this._logger.log(
                `Unable to get the attribute 'contentSize' when looking up touchPadding due to the following error:`,
                `'${err.message}'`,
              )
              return this._spec.getElementRegion(this.driver.target, this.target)
            })
          this._logger.log('Extracted native content size attribute', contentRegion)

          const contentSize = await this.driver.helper?.getContentSize(this)
          this._logger.log('Extracted native content size with helper library', contentSize)

          this._state.contentSize = {
            width: Math.max(contentSize?.width ?? 0, contentRegion.width),
            height: Math.max(contentSize?.height ?? 0, contentRegion.height),
          }
          this._touchPadding = touchPadding ?? this._touchPadding
          this._logger.log('touchPadding', this._touchPadding)

          if (this.driver.isAndroid) {
            this._state.contentSize = utils.geometry.scale(this._state.contentSize, 1 / this.driver.pixelRatio)
          }

          if (contentRegion.y < this.driver.statusBarHeight) {
            this._state.contentSize.height -= this.driver.statusBarHeight - contentRegion.y
          }

          // android has a bug when after extracting 'contentSize' attribute the element is being scrolled by undetermined number of pixels
          if (this.driver.isAndroid) {
            this._logger.log('Stabilizing android scroll offset')
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
      else if (this.driver.isIOS) this._touchPadding = 10
      else if (this.driver.isAndroid) {
        const data = await this.getAttribute('contentSize')
          .then(JSON.parse)
          .catch(err => {
            this._logger.log(
              `Unable to get the attribute 'contentSize' when looking up touchPadding due to the following error:`,
              `'${err.message}'`,
            )
          })
        this._touchPadding = data?.touchPadding ?? 20
        this._logger.log('touchPadding', this._touchPadding)
      }
    }
    return this._touchPadding
  }

  async getText(): Promise<string> {
    const text = await this.withRefresh(async () => {
      if (this.driver.isWeb) {
        return ''
      } else {
        this._logger.log('Extracting text of native element with selector', this.selector)
        return this._spec.getElementText(this.driver.target, this.target)
      }
    })
    this._logger.log('Extracted element text', text)
    return text
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
      offset = utils.geometry.round(offset)
      if (this.driver.isWeb) {
        let actualOffset = await this.context.execute(snippets.scrollTo, [this, offset])
        // iOS has an issue when scroll offset is read immediately after it is been set it will always return the exact value that was set
        if (this.driver.isIOS) actualOffset = await this.getScrollOffset()
        return actualOffset
      } else {
        const currentScrollOffset = await this.getScrollOffset()

        if (utils.geometry.equals(offset, currentScrollOffset)) return currentScrollOffset

        const contentSize = await this.getContentSize()
        const scrollableRegion = await this.getClientRegion()

        const effectiveRegion = this.driver.isAndroid
          ? utils.geometry.scale(scrollableRegion, this.driver.pixelRatio)
          : scrollableRegion
        const maxOffset = {
          x: Math.round(scrollableRegion.width * (contentSize.width / scrollableRegion.width - 1)),
          y: Math.round(scrollableRegion.height * (contentSize.height / scrollableRegion.height - 1)),
        }
        const requiredOffset = {x: Math.min(offset.x, maxOffset.x), y: Math.min(offset.y, maxOffset.y)}
        let remainingOffset =
          offset.x === 0 && offset.y === 0
            ? {x: -maxOffset.x, y: -maxOffset.y} // if it has to be scrolled to the very beginning, then scroll maximum amount of pixels
            : utils.geometry.offsetNegative(requiredOffset, currentScrollOffset)

        if (this.driver.isAndroid) {
          remainingOffset = utils.geometry.scale(remainingOffset, this.driver.pixelRatio)
        }

        const actions = []

        const touchPadding = await this.getTouchPadding()

        const xPadding = Math.max(Math.floor(effectiveRegion.width * 0.1), touchPadding)
        const yTrack = Math.floor(effectiveRegion.y + effectiveRegion.height / 2) // center
        const xLeft = effectiveRegion.y + xPadding
        const xDirection = remainingOffset.y > 0 ? 'right' : 'left'
        const xGap = xDirection === 'right' ? -touchPadding : touchPadding
        let xRemaining = Math.abs(remainingOffset.x)
        while (xRemaining > 0) {
          const xRight = effectiveRegion.x + Math.min(xRemaining + xPadding, effectiveRegion.width - xPadding)
          const [xStart, xEnd] = xDirection === 'right' ? [xRight, xLeft] : [xLeft, xRight]
          actions.push([
            {action: 'press', y: yTrack, x: xStart},
            {action: 'wait', ms: 100},
            {action: 'moveTo', y: yTrack, x: xStart + xGap},
            {action: 'wait', ms: 100},
            {action: 'moveTo', y: yTrack, x: xEnd + xGap},
            {action: 'wait', ms: 100},
            {action: 'moveTo', y: yTrack + 1, x: xEnd + xGap},
            {action: 'release'},
          ])
          xRemaining -= xRight - xLeft
        }

        const yPadding = Math.max(Math.floor(effectiveRegion.height * 0.1), touchPadding)
        const xTrack = Math.floor(effectiveRegion.x + 5) // a little bit off left border
        const yBottom = effectiveRegion.y + effectiveRegion.height - yPadding
        const yDirection = remainingOffset.y > 0 ? 'down' : 'up'
        const yGap = yDirection === 'down' ? -touchPadding : touchPadding
        let yRemaining = Math.abs(remainingOffset.y)
        while (yRemaining > 0) {
          const yTop = Math.max(yBottom - yRemaining, effectiveRegion.y + yPadding)
          const [yStart, yEnd] = yDirection === 'down' ? [yBottom, yTop] : [yTop, yBottom]
          actions.push([
            {action: 'press', x: xTrack, y: yStart},
            {action: 'wait', ms: 100},
            {action: 'moveTo', x: xTrack, y: yStart + yGap},
            {action: 'wait', ms: 100},
            {action: 'moveTo', x: xTrack, y: yEnd + yGap},
            {action: 'wait', ms: 100},
            {action: 'moveTo', x: xTrack + 1, y: yEnd + yGap},
            {action: 'release'},
          ])
          yRemaining -= yBottom - yTop
        }

        // ios actions should be executed one-by-one sequentially, otherwise the result isn't stable
        if (this.driver.isIOS) {
          for (const action of actions) {
            await this._spec.performAction(this.driver.target, action)
          }
        } else {
          await this._spec.performAction(this.driver.target, [].concat(...actions))
        }

        const actualScrollableRegion = await this.getClientRegion()
        this._state.scrollOffset = utils.geometry.offsetNegative(requiredOffset, {
          x: scrollableRegion.x - actualScrollableRegion.x,
          y: scrollableRegion.y - actualScrollableRegion.y,
        })

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

  async type(value: string): Promise<void> {
    await this._spec.type(this.context.target, this.target, value)
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
