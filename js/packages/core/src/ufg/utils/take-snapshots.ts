import type {Size, ChromeEmulationDevice, IOSDevice, ScreenOrientation} from '@applitools/types'
import type {DomSnapshot, AndroidVHS, IOSVHS} from '@applitools/types/ufg'
import {type Logger} from '@applitools/logger'
import {type Driver} from '@applitools/driver'
import {takeDomSnapshots, type DomSnapshotsSettings} from './take-dom-snapshots'
import {takeVHSes, type VHSesSettings} from './take-vhses'
import {takeSnapshots as takeSnapshotsWithNml} from '@applitools/nml-client'
import {extractBrokerUrl} from '../../utils/extract-broker-url'

export * from './take-dom-snapshots'
export * from './take-vhses'

export async function takeSnapshots<TDriver extends Driver<unknown, unknown, unknown, unknown>>({
  driver,
  settings,
  hooks,
  provides,
  logger,
}: {
  driver: TDriver
  settings: DomSnapshotsSettings & VHSesSettings
  hooks: {beforeSnapshots?(): void | Promise<void>; beforeEachSnapshot?(): void | Promise<void>}
  provides: {
    getChromeEmulationDevices(): Promise<Record<ChromeEmulationDevice, Record<ScreenOrientation, Size>>>
    getIOSDevices(): Promise<Record<IOSDevice, Record<ScreenOrientation, Size>>>
  }
  logger?: Logger
}): Promise<DomSnapshot[] | AndroidVHS[] | IOSVHS[]> {
  if (driver.isWeb) {
    return takeDomSnapshots({driver, settings, hooks, provides, logger})
  } else {
    const brokerUrl = await extractBrokerUrl(driver)
    if (brokerUrl) {
      return takeSnapshotsWithNml({url: brokerUrl, settings, logger})
    } else {
      return takeVHSes({driver, settings, hooks, logger})
    }
  }
}
