import type * as types from '@applitools/types'
import type {Driver} from './driver'
import * as utils from '@applitools/utils'
import {Element} from './element'

const snippets = require('@applitools/snippets')

export type ContextReference<TDriver, TContext, TElement, TSelector> =
  | Context<TDriver, TContext, TElement, TSelector>
  | TElement
  | TSelector
  | string
  | number

export type ContextPlain<TDriver, TContext, TElement, TSelector> =
  | ContextReference<TDriver, TContext, TElement, TSelector>
  | {
      reference: ContextReference<TDriver, TContext, TElement, TSelector>
      scrollingElement?: Element<TDriver, TContext, TElement, TSelector>
      parent?: ContextPlain<TDriver, TContext, TElement, TSelector>
    }

export type ContextState = {
  region?: types.Region
  clientRegion?: types.Region
  scrollingRegion?: types.Region
  innerOffset?: types.Location
}

export class Context<TDriver, TContext, TElement, TSelector> {
  private _target: TContext

  private _driver: Driver<TDriver, TContext, TElement, TSelector>
  private _parent: Context<TDriver, TContext, TElement, TSelector>
  private _element: Element<TDriver, TContext, TElement, TSelector>
  private _reference: ContextReference<TDriver, TContext, TElement, TSelector>
  private _scrollingElement: Element<TDriver, TContext, TElement, TSelector>
  private _state: ContextState = {}
  private _logger: any

  protected readonly _spec: types.SpecDriver<TDriver, TContext, TElement, TSelector>

  constructor(options: {
    spec: types.SpecDriver<TDriver, TContext, TElement, TSelector>
    context?: TContext | Context<TDriver, TContext, TElement, TSelector>
    driver?: Driver<TDriver, TContext, TElement, TSelector>
    parent?: Context<TDriver, TContext, TElement, TSelector>
    reference?: ContextReference<TDriver, TContext, TElement, TSelector>
    element?: Element<TDriver, TContext, TElement, TSelector>
    scrollingElement?: Element<TDriver, TContext, TElement, TSelector>
    logger?: any
  }) {
    if (options.context instanceof Context) return options.context

    this._spec = options.spec

    if (options.logger) this._logger = options.logger

    if (options.context) {
      if (this._spec.isContext?.(options.context) ?? this._spec.isDriver(options.context)) {
        this._target = options.context
      } else {
        throw new TypeError('Context constructor called with argument of unknown type of context!')
      }
    }

    if (this.isReference(options.reference)) {
      if (options.reference instanceof Context) return options.reference
      if (!options.parent) {
        throw new TypeError('Cannot construct child context without reference to the parent')
      }

      this._reference = options.reference
      this._parent = options.parent
      this._scrollingElement = options.scrollingElement
      this._driver = options.driver || this._parent.driver
    } else if (!options.reference) {
      this._element = null
      this._parent = null
      this._scrollingElement = options.scrollingElement
      this._driver = options.driver
    } else {
      throw new TypeError('Context constructor called with argument of unknown type!')
    }
  }

  get target(): TContext {
    return this._target
  }

  get driver(): Driver<TDriver, TContext, TElement, TSelector> {
    return this._driver
  }

  get parent(): Context<TDriver, TContext, TElement, TSelector> | null {
    return this._parent ?? null
  }

  get main(): Context<TDriver, TContext, TElement, TSelector> {
    return this.parent?.main ?? this
  }

  get path(): Context<TDriver, TContext, TElement, TSelector>[] {
    return [...(this.parent?.path ?? []), this]
  }

  get isMain(): boolean {
    return this.main === this
  }

  get isCurrent(): boolean {
    return this.driver.currentContext === this
  }

  get isInitialized(): boolean {
    return Boolean(this._element) || this.isMain
  }

  get isRef(): boolean {
    return !this._target
  }

  isReference(reference: any): reference is ContextReference<TDriver, TContext, TElement, TSelector> {
    return (
      reference instanceof Context ||
      utils.types.isInteger(reference) ||
      utils.types.isString(reference) ||
      reference instanceof Element ||
      this._spec.isElement(reference) ||
      this._spec.isSelector(reference)
    )
  }

  async init(): Promise<this> {
    if (this.isInitialized) return this
    if (!this._reference) throw new TypeError('Cannot initialize context without a reference to the context element')

    await this.parent.focus()

    this._logger.log('Context initialization')

    if (utils.types.isInteger(this._reference)) {
      this._logger.log('Getting context element using index:', this._reference)
      const elements = await this.parent.elements('frame, iframe')
      if (this._reference > elements.length) {
        throw new TypeError(`Context element with index ${this._reference} is not found`)
      }
      this._element = elements[this._reference]
    } else if (utils.types.isString(this._reference) || this._spec.isSelector(this._reference)) {
      if (utils.types.isString(this._reference)) {
        this._logger.log('Getting context element by name or id', this._reference)
        this._element = await this.parent
          .element(`iframe[name="${this._reference}"], iframe#${this._reference}`)
          .catch(() => null)
      }
      if (!this._element && this._spec.isSelector(this._reference)) {
        this._logger.log('Getting context element by selector', this._reference)
        this._element = await this.parent.element(this._reference)
      }
      if (!this._element) {
        throw new TypeError(
          `Context element with name, id, or selector ${JSON.stringify(this._reference)}' is not found`,
        )
      }
    } else if (this._spec.isElement(this._reference) || this._reference instanceof Element) {
      this._logger.log('Initialize context from reference element', this._reference)
      this._element = new Element({
        spec: this._spec,
        context: this.parent,
        element: this._reference,
        logger: this._logger,
      })
    } else {
      throw new TypeError('Reference type does not supported')
    }

    this._reference = null

    return this
  }

  async focus(): Promise<this> {
    if (this.isCurrent) {
      return this
    } else if (this.isMain) {
      await this.driver.switchToMainContext()
      return this
    }

    if (this.isRef) {
      await this.init()
    }

    if (!this.parent.isCurrent) {
      await this.driver.switchTo(this)
      return this
    }

    await this.parent.preserveInnerOffset()

    if (this.parent.isMain) await this.parent.preserveContextRegions()
    await this.preserveContextRegions()

    this._target = await this._spec.childContext(this.parent.target, this._element.target)

    this.driver.updateCurrentContext(this)

    return this
  }

  async equals(
    context: Context<TDriver, TContext, TElement, TSelector> | Element<TDriver, TContext, TElement, TSelector>,
  ): Promise<boolean> {
    if (context === this || (this.isMain && context === null)) return true
    if (!this._element) return false
    return this._element.equals(context instanceof Context ? await context.getContextElement() : context)
  }

  async context(
    reference: ContextPlain<TDriver, TContext, TElement, TSelector>,
  ): Promise<Context<TDriver, TContext, TElement, TSelector>> {
    if (reference instanceof Context) {
      if (reference.parent !== this) {
        throw Error('Cannot attach a child context because it has a different parent')
      }
      return reference
    } else if (this.isReference(reference)) {
      return new Context({spec: this._spec, parent: this, driver: this.driver, reference, logger: this._logger})
    } else if (utils.types.has(reference, 'reference')) {
      const parent = reference.parent ? await this.context(reference.parent) : this
      return new Context({
        spec: this._spec,
        parent,
        driver: this.driver,
        reference: reference.reference,
        scrollingElement: reference?.scrollingElement,
        logger: this._logger,
      })
    }
  }

  async element(
    selectorOrElement: types.SpecSelector<TSelector> | TElement,
  ): Promise<Element<TDriver, TContext, TElement, TSelector>> {
    if (this._spec.isSelector(selectorOrElement)) {
      if (this.isRef) {
        return new Element({spec: this._spec, context: this, selector: selectorOrElement, logger: this._logger})
      }
      await this.focus()

      let rootElement = null
      let selector = selectorOrElement
      while (utils.types.has(selector, ['selector', 'shadow']) && this._spec.isSelector(selector.shadow)) {
        const element: TElement = await this._spec.findElement(this.target, selector, rootElement)
        if (!element) return null
        rootElement = await this.execute(snippets.getShadowRoot, element)
        if (!rootElement) return null
        selector = selector.shadow
      }

      const element = await this._spec.findElement(this.target, selector, rootElement)
      return element
        ? new Element({spec: this._spec, context: this, element, selector: selectorOrElement, logger: this._logger})
        : null
    } else if (this._spec.isElement(selectorOrElement)) {
      return new Element({spec: this._spec, context: this, element: selectorOrElement, logger: this._logger})
    } else {
      throw new TypeError('Cannot find element using argument of unknown type!')
    }
  }

  async elements(
    selectorOrElement: types.SpecSelector<TSelector> | TElement,
  ): Promise<Element<TDriver, TContext, TElement, TSelector>[]> {
    if (this._spec.isSelector(selectorOrElement)) {
      if (this.isRef) {
        return [new Element({spec: this._spec, context: this, selector: selectorOrElement, logger: this._logger})]
      }
      await this.focus()

      let rootElement = null
      let selector = selectorOrElement
      while (utils.types.has(selector, ['selector', 'shadow']) && this._spec.isSelector(selector.shadow)) {
        const element: TElement = await this._spec.findElement(this.target, selector, rootElement)
        if (!element) return []
        rootElement = await this.execute(snippets.getShadowRoot, element)
        if (!rootElement) return []
        selector = selector.shadow
      }

      const elements = await this._spec.findElements(this.target, selector, rootElement)
      return elements.map((element, index) => {
        return new Element({
          spec: this._spec,
          context: this,
          element,
          selector: selectorOrElement,
          index,
          logger: this._logger,
        })
      })
    } else if (this._spec.isElement(selectorOrElement)) {
      return [new Element({spec: this._spec, context: this, element: selectorOrElement, logger: this._logger})]
    } else {
      throw new TypeError('Cannot find elements using argument of unknown type!')
    }
  }

  async execute(script: ((args: any) => any) | string, arg?: any): Promise<any> {
    await this.focus()
    try {
      return await this._spec.executeScript(this.target, script, serialize.call(this, arg))
    } catch (err) {
      this._logger.warn('Error during script execution with argument', arg)
      this._logger.error(err)
      throw err
    }

    function serialize(this: Context<TDriver, TContext, TElement, TSelector>, value: any): any {
      if (this._spec.isElement(value) || value instanceof Element) {
        return value instanceof Element ? value.toJSON() : value
      } else if (utils.types.isArray(value)) {
        return value.map(value => serialize.call(this, value))
      } else if (utils.types.isObject(value)) {
        return Object.entries(value.toJSON?.() ?? value).reduce((serialized, [key, value]) => {
          return Object.assign(serialized, {[key]: serialize.call(this, value)})
        }, {})
      } else {
        return value
      }
    }
  }

  async getContextElement(): Promise<Element<TDriver, TContext, TElement, TSelector>> {
    if (this.isMain) return null
    await this.init()
    return this._element
  }

  async getScrollingElement(): Promise<Element<TDriver, TContext, TElement, TSelector>> {
    if (!(this._scrollingElement instanceof Element)) {
      await this.focus()
      if (this._scrollingElement) {
        this._scrollingElement = await this.element(this._scrollingElement)
      } else {
        this._scrollingElement = await this.element(
          this.driver.isWeb ? {type: 'css', selector: 'html'} : {type: 'xpath', selector: '//*[@scrollable="true"]'},
        )
      }
    }
    return this._scrollingElement
  }

  async setScrollingElement(
    scrollingElement: Element<TDriver, TContext, TElement, TSelector> | TElement | types.SpecSelector<TSelector>,
  ): Promise<void> {
    if (scrollingElement === undefined) return
    else if (scrollingElement === null) this._scrollingElement = null
    else {
      this._scrollingElement =
        scrollingElement instanceof Element ? scrollingElement : await this.element(scrollingElement)
    }
  }

  async blurElement(element?: Element<TDriver, TContext, TElement, TSelector>): Promise<TElement> {
    try {
      return await this.execute(snippets.blurElement, [element])
    } catch (err) {
      this._logger.warn('Cannot blur element', element)
      this._logger.error(err)
      return null
    }
  }

  async focusElement(element: Element<TDriver, TContext, TElement, TSelector>) {
    try {
      return await this.execute(snippets.focusElement, [element])
    } catch (err) {
      this._logger.warn('Cannot focus element', element)
      this._logger.error(err)
      return null
    }
  }

  async getRegion(): Promise<types.Region> {
    if (this.isMain && this.isCurrent) {
      const viewportRegion = utils.geometry.region({x: 0, y: 0}, await this.driver.getViewportSize())
      this._state.region = this._scrollingElement
        ? utils.geometry.region(
            {x: 0, y: 0},
            utils.geometry.intersect(viewportRegion, await this._scrollingElement.getRegion()),
          )
        : viewportRegion
    } else if (this.parent?.isCurrent) {
      await this.init()
      this._state.region = await this._element.getRegion()
    }
    return this._state.region
  }

  async getClientRegion(): Promise<types.Region> {
    if (this.isMain && this.isCurrent) {
      const viewportRegion = utils.geometry.region({x: 0, y: 0}, await this.driver.getViewportSize())
      this._state.clientRegion = this._scrollingElement
        ? utils.geometry.region(
            {x: 0, y: 0},
            utils.geometry.intersect(viewportRegion, await this._scrollingElement.getClientRegion()),
          )
        : viewportRegion
    } else if (this.parent?.isCurrent) {
      await this.init()
      this._state.clientRegion = await this._element.getClientRegion()
    }
    return this._state.clientRegion
  }

  async getScrollingRegion(): Promise<types.Region> {
    if (this.isCurrent) {
      const scrollingElement = await this.getScrollingElement()
      this._state.scrollingRegion = await scrollingElement.getClientRegion()
    }
    return this._state.scrollingRegion
  }

  async getContentSize(): Promise<types.Size> {
    return this.execute(snippets.getDocumentSize)
  }

  async getInnerOffset(): Promise<types.Location> {
    if (this.isCurrent) {
      const scrollingElement = await this.getScrollingElement()
      this._state.innerOffset = scrollingElement ? await scrollingElement.getInnerOffset() : {x: 0, y: 0}
    }
    return this._state.innerOffset
  }

  async getLocationInMainContext(): Promise<types.Location> {
    return this.path.reduce((location, context) => {
      return location.then(async location => {
        return utils.geometry.offset(location, utils.geometry.location(await context.getClientRegion()))
      })
    }, Promise.resolve({x: 0, y: 0}))
  }

  async getLocationInViewport(): Promise<types.Location> {
    let location = utils.geometry.offsetNegative({x: 0, y: 0}, await this.getInnerOffset())

    if (this.isMain) return location

    let currentContext = this as Context<TDriver, TContext, TElement, TSelector>
    while (currentContext) {
      const contextLocation = utils.geometry.location(await currentContext.getClientRegion())
      const parentContextInnerOffset = (await currentContext.parent?.getInnerOffset()) ?? {x: 0, y: 0}

      location = utils.geometry.offsetNegative(
        utils.geometry.offset(location, contextLocation),
        parentContextInnerOffset,
      )
      currentContext = currentContext.parent
    }
    return location
  }

  async getRegionInViewport(region: types.Region): Promise<types.Region> {
    let currentContext = this as Context<TDriver, TContext, TElement, TSelector>

    if (region) region = utils.geometry.offsetNegative(region, await currentContext.getInnerOffset())
    else region = {x: 0, y: 0, width: Infinity, height: Infinity}

    while (currentContext) {
      const contextRegion = await currentContext.getClientRegion()
      // const contextScrollingRegion = await currentContext.getScrollingRegion()
      const parentContextInnerOffset = (await currentContext.parent?.getInnerOffset()) ?? {x: 0, y: 0}

      region = utils.geometry.intersect(contextRegion, utils.geometry.offset(region, contextRegion))
      // region = utils.geometry.intersect(contextScrollingRegion, region)
      region = utils.geometry.offsetNegative(region, parentContextInnerOffset)

      currentContext = currentContext.parent
    }
    return region
  }

  private async preserveInnerOffset() {
    this._state.innerOffset = await this.getInnerOffset()
  }

  private async preserveContextRegions() {
    this._state.region = await this.getRegion()
    this._state.clientRegion = await this.getClientRegion()
  }

  private async preserveScrollingRegion() {
    this._state.scrollingRegion = await this.getScrollingRegion()
  }
}
