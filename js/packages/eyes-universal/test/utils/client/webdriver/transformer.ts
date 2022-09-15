import type {Driver, Element} from '@applitools/spec-driver-selenium'
import type {TransformedDriver, TransformedElement} from '../shared/transform-data'

async function transformDriver(driver: Driver): Promise<TransformedDriver> {
  const session = await driver.getSession()
  const capabilities = await driver.getCapabilities()
  const serverUrl = (driver as any).__serverUrl
  return {
    serverUrl,
    sessionId: session.getId(),
    capabilities: Array.from(capabilities.keys()).reduce((caps: Record<string, any>, key) => {
      caps[key as string] = capabilities.get(key)
      return caps
    }, {}),
  }
}

async function transformElement(element: Element): Promise<TransformedElement> {
  return {elementId: await element.getId()}
}

export const transformer = {
  transformDriver,
  transformElement,
}
