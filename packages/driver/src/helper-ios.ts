import type * as types from '@applitools/types'
import type {Driver} from './driver'
import type {Element} from './element'

export class HelperIOS<TDriver, TContext, TElement, TSelector> {
  static async make<TDriver, TContext, TElement, TSelector>(options: {
    spec: types.SpecDriver<TDriver, TContext, TElement, TSelector>
    driver: Driver<TDriver, TContext, TElement, TSelector>
    logger: any
  }): Promise<HelperIOS<TDriver, TContext, TElement, TSelector> | null> {
    const {spec, driver, logger} = options
    const element = await driver.element({type: 'name', selector: 'applitools_grab_scrollable_data_button'})
    return element ? new HelperIOS<TDriver, TContext, TElement, TSelector>({driver, element, spec, logger}) : null
  }

  private readonly _driver: Driver<TDriver, TContext, TElement, TSelector>
  private readonly _element: Element<TDriver, TContext, TElement, TSelector>
  private readonly _spec: types.SpecDriver<TDriver, TContext, TElement, TSelector>
  private _logger: any

  constructor(options: {
    driver: Driver<TDriver, TContext, TElement, TSelector>
    element: Element<TDriver, TContext, TElement, TSelector>
    spec: types.SpecDriver<TDriver, TContext, TElement, TSelector>
    logger?: any
  }) {
    this._driver = options.driver
    this._element = options.element
    this._spec = options.spec
    this._logger = options.logger
  }

  async getContentSize(_element: Element<TDriver, TContext, TElement, TSelector>): Promise<types.Size> {
    await this._element.click()

    const sizeLabel = await this._driver.element({type: 'name', selector: 'applitools_content_size_label'})
    const sizeString = await sizeLabel?.getText()
    if (!sizeString) return null
    const [, width, height] = sizeString.match(/\{(-?\d+(?:\.\d+)?),\s?(-?\d+(?:\.\d+)?)\}/)
    const contentSize = {width: Number(width), height: Number(height)}
    if (Number.isNaN(contentSize.width + contentSize.height)) return null
    const paddingLabel = await this._driver.element({type: 'name', selector: 'applitools_content_offset_label'})
    const paddingString = await paddingLabel?.getText()
    if (!paddingString) return contentSize
    const [, x, y] = paddingString.match(/\{(-?\d+(?:\.\d+)?),\s?(-?\d+(?:\.\d+)?)\}/)
    const contentOffset = {x: Number(x), y: Number(y)}
    if (!Number.isNaN(contentOffset.x)) contentSize.width -= contentOffset.x
    if (!Number.isNaN(contentOffset.y)) contentSize.height -= contentOffset.y
    return contentSize
  }
}
