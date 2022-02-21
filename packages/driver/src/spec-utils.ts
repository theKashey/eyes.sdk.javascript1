import type * as types from '@applitools/types'
import * as utils from '@applitools/utils'

export function isCommonSelector<TSelector>(
  spec: Pick<types.SpecDriver<unknown, unknown, unknown, TSelector>, 'isSelector'>,
  selector: any,
): selector is types.CommonSelector<TSelector> {
  return (
    utils.types.isPlainObject(selector) &&
    utils.types.has(selector, 'selector') &&
    (utils.types.isString(selector.selector) || spec.isSelector(selector.selector))
  )
}

export function isSelector<TSelector>(
  spec: Pick<types.SpecDriver<unknown, unknown, unknown, TSelector>, 'isSelector'>,
  selector: any,
): selector is types.Selector<TSelector> {
  return spec.isSelector(selector) || utils.types.isString(selector) || isCommonSelector(spec, selector)
}

export function transformSelector<TSelector>(
  spec: Pick<types.SpecDriver<unknown, unknown, unknown, TSelector>, 'isSelector' | 'transformSelector'>,
  selector: types.Selector<TSelector>,
  environment?: {isWeb?: boolean; isNative?: boolean; isIOS?: boolean; isAndroid?: boolean},
): TSelector {
  if (environment?.isWeb && isCommonSelector(spec, selector)) {
    if (selector.type === 'id') selector = {type: 'css', selector: `#${selector.selector}`}
    if (selector.type === 'name') selector = {type: 'css', selector: `[name="${selector.selector}"]`}
    if (selector.type === 'class name') selector = {type: 'css', selector: `.${selector.selector}`}
  }
  return spec.transformSelector?.(selector) ?? (selector as TSelector)
}

export function splitSelector<TSelector>(
  spec: Pick<types.SpecDriver<unknown, unknown, unknown, TSelector>, 'isSelector'>,
  selector: types.Selector<TSelector>,
): {
  contextSelectors: types.Selector<TSelector>[]
  elementSelector: types.Selector<TSelector>
} {
  let targetSelector = selector
  let activeSelector = {} as types.CommonSelector<TSelector>
  let elementSelector = activeSelector
  const contextSelectors = [] as types.Selector<TSelector>[]
  while (targetSelector) {
    if (isCommonSelector(spec, targetSelector)) {
      activeSelector.selector = targetSelector.selector
      if (targetSelector.type) activeSelector.type = targetSelector.type

      if (targetSelector.shadow) {
        activeSelector = activeSelector.shadow = {} as types.CommonSelector<TSelector>
        targetSelector = targetSelector.shadow
      } else if (targetSelector.frame) {
        contextSelectors.push(elementSelector)
        elementSelector = activeSelector = {} as types.CommonSelector<TSelector>
        targetSelector = targetSelector.frame
      } else {
        targetSelector = null
      }
    } else {
      activeSelector.selector = targetSelector
      targetSelector = null
    }
  }

  return {contextSelectors, elementSelector}
}
