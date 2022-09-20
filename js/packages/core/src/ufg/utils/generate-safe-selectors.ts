import type {Selector} from '@applitools/types'
import {type Context, type Element} from '@applitools/driver'
import * as snippets from '@applitools/snippets'
import * as utils from '@applitools/utils'

export async function generateSafeSelectors<TElement, TSelector>({
  context,
  elementReferences,
}: {
  context: Context<unknown, unknown, TElement, TSelector>
  elementReferences: (TElement | Selector<TSelector>)[]
}): Promise<{
  selectors: {safeSelector: Selector; originalSelector: Selector}[]
  cleanupGeneratedSelectors(): Promise<void>
}> {
  const mapping = {
    elements: [] as Element<unknown, unknown, TElement, TSelector>[][],
    ids: [] as string[][],
  }

  for (const elementReference of elementReferences) {
    const elements = await context.elements(elementReference)
    mapping.elements.push(elements)
    mapping.ids.push(Array(elements.length).fill(utils.general.guid()))
  }

  const generatedSelectors = await context.execute(snippets.addElementIds, [mapping.elements.flat(), mapping.ids.flat()])
  let offset = 0
  const selectors = mapping.elements.map(elements => {
    if (elements.length === 0) return null
    const safeSelector = generatedSelectors[offset].reduce((selector, value) => {
      return selector ? {...selector, shadow: {type: 'css', selector: value}} : {type: 'css', selector: value}
    }, null as Selector)
    offset += elements.length
    return {safeSelector, originalSelector: elements[0].commonSelector}
  })

  return {
    selectors,
    cleanupGeneratedSelectors,
  }

  async function cleanupGeneratedSelectors() {
    if (!mapping.elements.length) return
    await context.execute(snippets.cleanupElementIds, [mapping.elements.flat()])
  }
}
