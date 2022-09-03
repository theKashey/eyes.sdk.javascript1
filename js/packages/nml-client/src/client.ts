import {broker, BrokerRequest, ScreenshotSettings, SnapshotSettings} from './broker'
import * as utils from '@applitools/utils'

export async function takeScreenshot(url: any, options?: ScreenshotSettings): Promise<string> {
  const request: BrokerRequest = {
    protocolVersion: '1.0',
    name: 'TAKE_SCREENSHOT',
    key: utils.general.guid(),
    payload: options,
  }
  const {screenshotURL} = await broker(url, request)
  return screenshotURL
}

export async function takeSnapshot(url: string, options?: SnapshotSettings): Promise<any> {
  const request: BrokerRequest = {
    protocolVersion: '1.0',
    name: 'TAKE_SNAPSHOT',
    key: utils.general.guid(),
    payload: options,
  }
  const result = await broker(url, request)
  return result
}
