import type * as types from '@applitools/types'
import * as utils from '@applitools/utils'

const snippets = require('@applitools/snippets')

export type SpecUtils<_TDriver, TContext, TElement, TSelector> = {
  isSelector(selector: any): selector is types.Selector<TSelector>
  transformSelector(selector: types.Selector<TSelector>): TSelector
  splitSelector(selector: types.Selector<TSelector>): types.Selector<TSelector>[]
  findRootElement(
    context: TContext,
    selector: types.Selector<TSelector>,
  ): Promise<{root: TElement; selector: types.Selector<TSelector>}>
}

export function makeSpecUtils<TDriver, TContext, TElement, TSelector>(
  spec: types.SpecDriver<TDriver, TContext, TElement, TSelector>,
): SpecUtils<TDriver, TContext, TElement, TSelector> {
  return {isSelector, transformSelector, splitSelector, findRootElement}

  function isSelector(selector: any): selector is types.Selector<TSelector> {
    return (
      spec.isSelector(selector) ||
      utils.types.isString(selector) ||
      (utils.types.isPlainObject(selector) &&
        utils.types.has(selector, 'selector') &&
        (utils.types.isString(selector.selector) || spec.isSelector(selector.selector)))
    )
  }
  function transformSelector(selector: types.Selector<TSelector>): TSelector {
    return spec.transformSelector?.(selector) ?? (selector as TSelector)
  }
  function splitSelector(selector: types.Selector<TSelector>): types.Selector<TSelector>[] {
    let current = selector
    let active = {} as any
    const path = [active]
    while (
      utils.types.has(current, 'selector') &&
      (utils.types.has(current, 'frame') || utils.types.has(current, 'shadow'))
    ) {
      active.selector = current.selector
      if (current.type) active.type = current.type
      if (current.frame) {
        active = {}
        path.push(active)
        current = current.frame
      } else if (current.shadow) {
        active = active.shadow = {}
        current = current.shadow
      }
    }

    if (spec.isSelector(current) || utils.types.isString(current)) {
      active.selector = current
    } else {
      active.selector = current.selector
      if (current.type) active.type = current.type
    }
    return path
  }

  async function findRootElement(
    context: TContext,
    selector: types.Selector<TSelector>,
  ): Promise<{root: TElement; selector: types.Selector<TSelector>}> {
    let root = null as TElement
    let currentSelector = selector
    while (utils.types.has(currentSelector, ['selector', 'shadow']) && isSelector(currentSelector.shadow)) {
      const element = await spec.findElement(context, transformSelector(currentSelector), root)
      if (!element) break
      root = await spec.executeScript(context, snippets.getShadowRoot, [element])
      if (!root) break
      currentSelector = currentSelector.shadow
    }
    return {root, selector: currentSelector}
  }
}
