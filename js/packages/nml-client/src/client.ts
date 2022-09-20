import type {Selector, Renderer} from '@applitools/types'
import type {Screenshot, ScreenshotSettings as ClassicScreenshotSettings} from '@applitools/types/classic'
import type {AndroidVHS, IOSVHS} from '@applitools/types/ufg'
import {makeLogger, type Logger} from '@applitools/logger'
import {makeReqBroker, type ReqBrokerConfig} from './req-broker'
import * as utils from '@applitools/utils'

export type ScreenshotSettings = ReqBrokerConfig &
  ClassicScreenshotSettings<never, never> & {name?: string; selectorsToFindRegionsFor?: Selector[]}

export type SnapshotSettings = ReqBrokerConfig & {
  name?: string
  renderers: Renderer[]
  resourceSeparation?: boolean
  waitBeforeCapture?: number
}

export async function takeScreenshot({
  url,
  settings,
  logger,
}: {
  url: string
  settings: ScreenshotSettings
  logger?: Logger
}): Promise<Screenshot> {
  logger = logger?.extend({label: 'nml client'}) ?? makeLogger({label: 'nml client'})
  const req = makeReqBroker({config: settings, logger})
  const payload = {
    name: settings.name,
    screenshotMode: settings.fully ? 'FULL_RESIZE' : 'VIEWPORT',
    scrollRootElement: settings.scrollRootElement,
    hideCaret: settings.hideCaret,
    waitBeforeCapture: settings.waitBeforeCapture,
    overlap: settings.overlap,
    selectorsToFindRegionsFor: [] as any[],
  }
  const response = await req(url, {
    name: 'TAKE_SCREENSHOT',
    body: {
      protocolVersion: '1.0',
      name: 'TAKE_SCREENSHOT',
      key: utils.general.guid(),
      payload,
    },
    logger,
  })
  const result = await response.json()
  return result.payload
}

export async function takeSnapshots({
  url,
  settings,
  logger,
}: {
  url: string
  settings: SnapshotSettings
  logger?: Logger
}): Promise<IOSVHS[] | AndroidVHS[]> {
  logger = logger?.extend({label: 'nml client'}) ?? makeLogger({label: 'nml client'})
  const req = makeReqBroker({config: settings, logger})
  const payload = {
    waitBeforeCapture: settings.waitBeforeCapture,
  }
  const response = await req(url, {
    name: 'TAKE_SNAPSHOT',
    body: {
      protocolVersion: '1.0',
      name: 'TAKE_SNAPSHOT',
      key: utils.general.guid(),
      payload,
    },
  })
  const snapshot: AndroidVHS | IOSVHS = await response.json().then(({payload}) => {
    const {resourceMap, metadata} = payload.result
    const platformName = resourceMap.metadata.platformName
    return {
      platformName,
      vhsHash: resourceMap.vhs,
      vhsCompatibilityParams:
        platformName === 'ios'
          ? {
              UIKitLinkTimeVersionNumber: metadata.UIKitLinkTimeVersionNumber,
              UIKitRunTimeVersionNumber: metadata.UIKitRunTimeVersionNumber,
            }
          : undefined,
    }
  })

  return Array(settings.renderers.length).fill(snapshot)
}
