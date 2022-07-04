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
    let input = await driver.element({type: 'xpath', selector: '//*[@content-desc="EyesAppiumHelperEDT"]'})
    if (!input) {
      legacy = true
      input = await driver.element({type: 'xpath', selector: '//*[@content-desc="EyesAppiumHelper"]'})
    }
    const action = !legacy
      ? await driver.element({type: 'xpath', selector: '//*[@content-desc="EyesAppiumHelper_Action"]'})
      : null
    return input
      ? new HelperAndroid<TDriver, TContext, TElement, TSelector>({spec, input, action, legacy, logger})
      : null
  }

  private readonly _spec: types.SpecDriver<TDriver, TContext, TElement, TSelector>
  private readonly _input: Element<TDriver, TContext, TElement, TSelector>
  private readonly _action?: Element<TDriver, TContext, TElement, TSelector>
  private readonly _legacy: boolean
  private _logger: Logger

  readonly name: 'android' | 'android-legacy'

  constructor(options: {
    spec: types.SpecDriver<TDriver, TContext, TElement, TSelector>
    input: Element<TDriver, TContext, TElement, TSelector>
    action?: Element<TDriver, TContext, TElement, TSelector>
    legacy: boolean
    logger?: any
  }) {
    this._spec = options.spec
    this._input = options.input
    this._action = options.action
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
      await this._input.click()
      contentHeightString = await this._input.getText()
    } else {
      const elementId = await this._getElementId(element)
      if (!elementId) return null
      await this._input.type(`offset;${elementId};0;0;0`)
      if (this._action) await this._action.type('1')
      else await this._input.click()
      contentHeightString = await this._input.getText()
      await this._input.type('')
    }

    const region = await this._spec.getElementRegion(this._input.driver.target, element.target)
    const contentHeight = Number(contentHeightString)

    if (Number.isNaN(contentHeight)) return utils.geometry.size(region)

    return {width: region.width, height: contentHeight}
  }

  async getRegion(element: Element<TDriver, TContext, TElement, TSelector>): Promise<types.Region> {
    if (this._legacy) return null

    const elementId = await this._getElementId(element)
    if (!elementId) return null
    await this._input.type(`getRect;${elementId};0;0`)
    if (this._action) await this._action.type('1')
    else await this._input.click()
    const regionString = await this._input.getText()
    await this._input.type('')
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
    await this._input.type(`moveToTop;${elementId};0;-1`)
    if (this._action) await this._action.type('1')
    else await this._input.click()
    await this._input.type('')
  }

  async scrollBy(element: Element<TDriver, TContext, TElement, TSelector>, offset: types.Location): Promise<void> {
    if (this._legacy) return null

    const elementId = await this._getElementId(element)
    if (!elementId) return null
    await this._input.type(`scroll;${elementId};${offset.y};0;0`)
    if (this._action) await this._action.type('1')
    else await this._input.click()
    await this._input.type('')
  }

  async getTouchPadding(): Promise<number> {
    if (this._legacy) return null

    await this._input.type(`getTouchPadding;0;0;0;0`)
    if (this._action) await this._action.type('1')
    else await this._input.click()
    const touchPaddingString = await this._input.getText()
    await this._input.type('')

    const touchPadding = Number(touchPaddingString)

    if (Number.isNaN(touchPadding)) return null

    return touchPadding
  }
}
