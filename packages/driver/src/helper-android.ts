import type * as types from '@applitools/types'
import type {Driver} from './driver'
import type {Element} from './element'

export class HelperAndroid<TDriver, TContext, TElement, TSelector> {
  static async make<TDriver, TContext, TElement, TSelector>(options: {
    spec: types.SpecDriver<TDriver, TContext, TElement, TSelector>
    driver: Driver<TDriver, TContext, TElement, TSelector>
    logger: any
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
  private _logger: any

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
  }

  async _getElementId(element: Element<TDriver, TContext, TElement, TSelector>): Promise<string> {
    const resourceId = await element.getAttribute('resource-id')
    if (!resourceId) return null
    return resourceId.split('/')[1]
  }

  async getContentSize(element: Element<TDriver, TContext, TElement, TSelector>): Promise<types.Size> {
    let contentHeight
    if (this._legacy) {
      await this._element.click()
      contentHeight = await this._element.getText()
    } else {
      const elementId = await this._getElementId(element)
      if (!elementId) return null
      await this._element.type(`offset;${elementId};0;0;0`)
      await this._element.click()
      contentHeight = await this._element.getText()
      await this._element.type('')
    }

    const region = await this._spec.getElementRegion(this._element.driver.target, element.target)

    return {width: region.width, height: Number(contentHeight)}
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
}
