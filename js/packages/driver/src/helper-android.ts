import type * as types from '@applitools/types'
import {type Logger} from '@applitools/logger'
import type {Driver} from './driver'
import type {Element} from './element'
import * as utils from '@applitools/utils'
import semverGte from 'semver/functions/gte'

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
    const versionElement = await driver.element({
      type: 'xpath',
      selector: '//*[@content-desc="EyesAppiumHelper_Version"]',
    })
    const version = (await versionElement?.getText()) ?? '0.0.0'
    const action = !legacy
      ? await driver.element({type: 'xpath', selector: '//*[@content-desc="EyesAppiumHelper_Action"]'})
      : null
    return input
      ? new HelperAndroid<TDriver, TContext, TElement, TSelector>({
          spec,
          input,
          action,
          legacy,
          logger,
          supportAsync: semverGte(version, '1.8.0'),
        })
      : null
  }

  private readonly _spec: types.SpecDriver<TDriver, TContext, TElement, TSelector>
  private readonly _input: Element<TDriver, TContext, TElement, TSelector>
  private readonly _action?: Element<TDriver, TContext, TElement, TSelector>
  private readonly _legacy: boolean
  private readonly _supportAsync: boolean = false
  private _logger: Logger

  readonly name: 'android' | 'android-legacy'

  constructor(options: {
    spec: types.SpecDriver<TDriver, TContext, TElement, TSelector>
    input: Element<TDriver, TContext, TElement, TSelector>
    action?: Element<TDriver, TContext, TElement, TSelector>
    legacy: boolean
    logger?: any
    supportAsync?: boolean
  }) {
    this._spec = options.spec
    this._input = options.input
    this._action = options.action
    this._legacy = options.legacy
    this._logger = options.logger
    this.name = this._legacy ? 'android-legacy' : 'android'
    this._supportAsync = options.supportAsync === true
  }

  private async _getElementId(element: Element<TDriver, TContext, TElement, TSelector>): Promise<string> {
    const resourceId = await element.getAttribute('resource-id')
    if (!resourceId) return null
    return resourceId.split('/')[1]
  }

  private async _command(command: string): Promise<string> {
    // clean the input before passing value there could
    // be a left over from previous async calls
    await this._input.type('')

    await this._input.type(command)
    await this._input.click()
    let text = await this._input.getText()
    if (this._action && text === command) {
      await this._action.type('1').catch(() => null)
      text = await this._input.getText()
    }

    // wait until the JAVA complete the async operation
    const timeout = 5 * 60 * 1000
    const finishAt = Date.now() + timeout
    while (text === 'WAIT' && finishAt > Date.now()) {
      await utils.general.sleep(1000)
      text = await this._input.getText()
    }
    if (text === 'WAIT') {
      this._logger.warn(`Helper library didn't provide a response for async command (${command}) during ${timeout}ms`)
      text = null
    }

    await this._input.type('')
    return text
  }

  async getContentRegion(
    element: Element<TDriver, TContext, TElement, TSelector>,
    options?: {lazyLoad?: {scrollLength?: number; waitingTime?: number; maxAmountToScroll?: number}},
  ): Promise<types.Region> {
    const elementId = await this._getElementId(element)
    if (!elementId) return null

    let contentHeightString
    if (this._legacy) {
      await this._input.click()
      contentHeightString = await this._input.getText()
    } else if (this._supportAsync && options?.lazyLoad?.waitingTime) {
      const result = await this._command(`offset_async;${elementId};0;0;0;${options?.lazyLoad?.waitingTime ?? 0}`)
      contentHeightString = result.split(';')[0]
    } else {
      contentHeightString = await this._command(`offset;${elementId};0;0;0;0`)
    }

    const contentHeight = Number(contentHeightString)
    if (Number.isNaN(contentHeight)) return null

    const region = await this._spec.getElementRegion(this._input.driver.target, element.target)
    if (contentHeight < region.height) return null

    return {x: region.x, y: region.y, width: region.width, height: contentHeight}
  }

  async getTouchPadding(): Promise<number> {
    if (this._legacy) return null

    const touchPaddingString = await this._command(`getTouchPadding;0;0;0;0;0`)

    const touchPadding = Number(touchPaddingString)
    if (!touchPadding || Number.isNaN(touchPadding)) return null

    return touchPadding
  }

  async getRegion(element: Element<TDriver, TContext, TElement, TSelector>): Promise<types.Region> {
    if (this._legacy) return null

    const elementId = await this._getElementId(element)
    if (!elementId) return null
    const regionString = await this._command(`getRect;${elementId};0;0;0`)
    if (!regionString) return null
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
    await this._command(`moveToTop;${elementId};0;-1;0`)
  }

  async scrollBy(element: Element<TDriver, TContext, TElement, TSelector>, offset: types.Location): Promise<void> {
    if (this._legacy) return null

    const elementId = await this._getElementId(element)
    if (!elementId) return null
    await this._command(`scroll;${elementId};${offset.y};0;0;0`)
  }
}
