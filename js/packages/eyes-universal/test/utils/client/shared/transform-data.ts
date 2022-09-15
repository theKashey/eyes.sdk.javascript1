import type * as types from '@applitools/types'
import * as utils from '@applitools/utils'

export type TransformedDriver = {sessionId: string; serverUrl: string; capabilities: Record<string, any>}
export type TransformedElement = {elementId: string}
export type TransformedSelector = types.Selector<never>

export type Spec<Driver, Element> = {
  isDriver: (d: any) => d is Driver
  isElement: (e: any) => e is Element
}

export type Transformer<Driver, Element> = {
  transformDriver: (d: Driver) => Promise<TransformedDriver>
  transformElement: (e: Element) => Promise<TransformedElement>
}

export async function transformData<Driver, Element>({
  spec,
  transformer,
  data,
}: {
  spec: Spec<Driver, Element>
  transformer: Transformer<Driver, Element>
  data: any
}): Promise<any> {
  if (spec.isDriver(data)) {
    return transformer.transformDriver(data)
  } else if (spec.isElement(data)) {
    return transformer.transformElement(data)
  } else if (utils.types.isArray(data)) {
    return Promise.all((data as Array<any>).map(x => transformData({spec, transformer, data: x})))
  } else if (utils.types.isObject(data)) {
    return Object.entries(data).reduce(async (data, [key, value]) => {
      const transformed = await transformData({spec, transformer, data: value})
      return data.then(data => Object.assign(data, {[key]: transformed}))
    }, Promise.resolve({}))
  } else {
    return data
  }
}
