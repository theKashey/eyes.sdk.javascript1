import { takeDomSnapshot } from '@applitools/eyes-sdk-core'

export function buildCheckUsingVisualGrid(eyes, driver, logger) {
  return async (params = {}) => {
    const snapshot = await takeDomSnapshot(logger, driver)
    eyes.checkWindow({
      url: snapshot.url,
      snapshot,
      ...params,
    })
  }
}
