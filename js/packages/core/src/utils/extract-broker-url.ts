import {type Driver} from '@applitools/driver'

export async function extractBrokerUrl(driver: Driver<unknown, unknown, unknown, unknown>): Promise<string> {
  if (!driver.isIOS) return null
  try {
    const element = await driver.element({
      type: 'xpath',
      selector: '//XCUIElementTypeOther[@name="Applitools_View"]',
    })
    const result = JSON.parse(await element.getText())
    return result.nextPath
  } catch (error) {
    return null
  }
}
