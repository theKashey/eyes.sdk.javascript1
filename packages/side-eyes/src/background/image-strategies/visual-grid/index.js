import { getSnapshot } from './dom-snapshot'

export function buildCheckUsingVisualGrid(eyes, tabId) {
  return async (params = {}) => {
    const snapshot = await getSnapshot(tabId)
    eyes.checkWindow({
      url: snapshot.url,
      snapshot,
      ...params,
    })
  }
}
