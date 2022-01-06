import type * as types from '@applitools/types'
import type {Driver, Element} from '@applitools/spec-driver-selenium'

export * from '@applitools/spec-driver-selenium'

export type TransformedDriver = {sessionId: string; serverUrl: string; capabilities: Record<string, any>}
export type TransformedElement = {elementId: string}
export type TransformedSelector = types.Selector<never>

export async function transformDriver(driver: Driver): Promise<TransformedDriver> {
  const session = await driver.getSession()
  const capabilities = await driver.getCapabilities()
  return {
    serverUrl: 'http://localhost:4444/wd/hub',
    // serverUrl: 'https://ondemand.saucelabs.com/wd/hub',
    // serverUrl: 'https://hub.browserstack.com/wd/hub',
    sessionId: session.getId(),
    capabilities: Array.from(capabilities.keys()).reduce((caps, key) => {
      caps[key] = capabilities.get(key)
      return caps
    }, {} as Record<string, any>),
  }
}

export async function transformElement(element: Element): Promise<TransformedElement> {
  return {elementId: await element.getId()}
}
