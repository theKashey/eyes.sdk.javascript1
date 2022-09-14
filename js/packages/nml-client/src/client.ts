import {broker, BrokerRequest, ScreenshotSettings, SnapshotSettings} from './broker'
import * as utils from '@applitools/utils'

export async function takeScreenshot(
  url: any,
  options?: {settings?: ScreenshotSettings; proxy?: any; logger?: any},
): Promise<string> {
  if (options && options.logger) options.logger.log('[nml-client]: takeScreenshot called with', url, options)
  const request: BrokerRequest = {
    protocolVersion: '1.0',
    name: 'TAKE_SCREENSHOT',
    key: utils.general.guid(),
    payload: options && options.settings,
  }
  const {screenshotURL} = await broker(url, request, {proxy: options && options.proxy})
  return screenshotURL
}

export async function takeSnapshot(
  url: string,
  options?: {settings?: SnapshotSettings; proxy?: any; logger?: any},
): Promise<any> {
  if (options && options.logger) options.logger.log('[nml-client]: takeSnapshot called with', url, options)
  const request: BrokerRequest = {
    protocolVersion: '1.0',
    name: 'TAKE_SNAPSHOT',
    key: utils.general.guid(),
    payload: options && options.settings,
  }
  const result = await broker(url, request, {proxy: options && options.proxy})
  return result
}
