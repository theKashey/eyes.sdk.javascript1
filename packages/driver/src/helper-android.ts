import type * as types from '@applitools/types'
import {type Logger} from '@applitools/logger'
import type {Driver} from './driver'
import type {Element} from './element'
import * as utils from '@applitools/utils'

export class HelperAndroid<TDriver, TContext, TElement, TSelector> {
  static async make<TDriver, TContext, TElement, TSelector>(options: {
    spec: types.SpecDriver<TDriver, TContext, TElement, TSelector>
    driver: Driver<TDriver, TContext, TElement, TSelector>
    logger: Logger
  }): Promise<HelperAndroid<TDriver, TContext, TElement, TSelector> | null> {
    const {spec, driver, logger} = options
    let legacy = false
    let element = await driver.element({
      type: 'xpath',
      selector: '//*[@content-desc="EyesAppiumHelperEDT"]',
    })
    if (!element) {
      legacy = true
      element = await driver.element({
        type: '-android uiautomator',
        selector: 'new UiSelector().description("EyesAppiumHelper")',
      })
    }
    return element ? new HelperAndroid<TDriver, TContext, TElement, TSelector>({spec, element, legacy, logger}) : null
  }

  private readonly _spec: types.SpecDriver<TDriver, TContext, TElement, TSelector>
  private readonly _element: Element<TDriver, TContext, TElement, TSelector>
  private readonly _legacy: boolean
  private _logger: Logger

  readonly name: 'android' | 'android-legacy'

  constructor(options: {
    spec: types.SpecDriver<TDriver, TContext, TElement, TSelector>
    element: Element<TDriver, TContext, TElement, TSelector>
    legacy: boolean
    logger?: any
  }) {
    this._spec = options.spec
    this._element = options.element
    this._legacy = options.legacy
    this._logger = options.logger
    this.name = this._legacy ? 'android-legacy' : 'android'
  }

  async _getElementId(element: Element<TDriver, TContext, TElement, TSelector>): Promise<string> {
    const resourceId = await element.getAttribute('resource-id')
    if (!resourceId) return null
    return resourceId.split('/')[1]
  }

  async getContentSize(element: Element<TDriver, TContext, TElement, TSelector>): Promise<types.Size> {
    let contentHeightString
    if (this._legacy) {
      await this._element.click()
      contentHeightString = await this._element.getText()
    } else {
      const elementId = await this._getElementId(element)
      if (!elementId) return null
      await this._element.type(`offset;${elementId};0;0;0`)
      await this._element.click()
      contentHeightString = await this._element.getText()
      await this._element.type('')
    }

    const region = await this._spec.getElementRegion(this._element.driver.target, element.target)
    const contentHeight = Number(contentHeightString)

    if (Number.isNaN(contentHeight)) return utils.geometry.size(region)

    return {width: region.width, height: contentHeight}
  }

  async getRegion(element: Element<TDriver, TContext, TElement, TSelector>): Promise<types.Region> {
    if (this._legacy) return null

    const elementId = await this._getElementId(element)
    if (!elementId) return null
    await this._element.type(`getRect;${elementId};0;0`)
    await this._element.click()
    const regionString = await this._element.getText()
    await this._element.type('')
    const [, x, y, height, width] = regionString.match(
      /\[(-?\d+(?:\.\d+)?);(-?\d+(?:\.\d+)?);(-?\d+(?:\.\d+)?);(-?\d+(?:\.\d+)?)\]/,
    )
    const region = {x: Number(x), y: Number(y), width: Number(width), height: Number(height)}
    if (Number.isNaN(region.x + region.y + region.width + region.height)) return null

    return region
  }

  async scrollToTop(element: Element<TDriver, TContext, TElement, TSelector>): Promise<void> {
    if (this._legacy) return null

    const elementId = await this._getElementId(element)
    if (!elementId) return null
    await this._element.type(`moveToTop;${elementId};0;-1`)
    await this._element.click()
    await this._element.type('')
  }

  async scrollBy(element: Element<TDriver, TContext, TElement, TSelector>, offset: types.Location): Promise<void> {
    if (this._legacy) return null

    const elementId = await this._getElementId(element)
    if (!elementId) return null
    await this._element.type(`scroll;${elementId};${offset.y};0;0`)
    await this._element.click()
    await this._element.type('')
  }

  async getTouchPadding(): Promise<number> {
    if (this._legacy) return null

    await this._element.type(`getTouchPadding;0;0;0;0`)
    await this._element.click()
    const touchPaddingString = await this._element.getText()
    await this._element.type('')

    const touchPadding = Number(touchPaddingString)

    if (Number.isNaN(touchPadding)) return null

    return touchPadding
  }
}
