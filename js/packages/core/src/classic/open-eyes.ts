import type {SpecDriver} from '@applitools/types'
import type {Core as BaseCore} from '@applitools/types/base'
import type {Eyes, Target, OpenSettings} from '@applitools/types/classic'
import {type Logger} from '@applitools/logger'
import {makeDriver} from '@applitools/driver'
import {makeCheck} from './check'
import {makeCheckAndClose} from './check-and-close'
import {makeLocateText} from './locate-text'
import {makeExtractText} from './extract-text'
import * as utils from '@applitools/utils'

type Options<TDriver, TContext, TElement, TSelector> = {
  spec: SpecDriver<TDriver, TContext, TElement, TSelector>
  core: BaseCore
  logger?: Logger
}

export function makeOpenEyes<TDriver, TContext, TElement, TSelector>({
  spec,
  core,
  logger: defaultLogger,
}: Options<TDriver, TContext, TElement, TSelector>) {
  return async function openEyes({
    target,
    settings,
    logger = defaultLogger,
  }: {
    target?: Target<TDriver>
    settings: OpenSettings
    logger?: Logger
  }): Promise<Eyes<TDriver, TElement, TSelector>> {
    logger.log(`Command "openEyes" is called with ${spec?.isDriver(target) ? 'default driver and' : ''} settings`, settings)

    // TODO driver custom config
    const driver = spec?.isDriver(target) ? await makeDriver({spec, driver: target, logger}) : null

    if (driver) {
      settings.environment ??= {}
      if (!settings.environment.viewportSize || driver.isMobile) {
        const size = await driver.getViewportSize()
        settings.environment.viewportSize = utils.geometry.scale(size, driver.viewportScale)
      } else {
        await driver.setViewportSize(settings.environment.viewportSize)
      }

      if (!settings.environment.userAgent && driver.isWeb) {
        settings.environment.userAgent = driver.userAgent
      }

      if (!settings.environment.deviceName && driver.deviceName) {
        settings.environment.deviceName = driver.deviceName
      }

      if (!settings.environment.os && driver.isNative && driver.platformName) {
        settings.environment.os = driver.platformName
        if (!settings.keepPlatformNameAsIs) {
          if (settings.environment.os?.startsWith('android')) {
            settings.environment.os = `Android${settings.environment.os.slice(7)}`
          }
          if (settings.environment.os?.startsWith('ios')) {
            settings.environment.os = `iOS${settings.environment.os.slice(3)}`
          }
        }
        if (driver.platformVersion) {
          settings.environment.os += ` ${driver.platformVersion}`
        }
      }
    }

    const eyes = await core.openEyes({settings, logger})

    return utils.general.extend(eyes, {
      check: makeCheck({spec, eyes, target, logger}),
      checkAndClose: makeCheckAndClose({spec, eyes, target, logger}),
      locateText: makeLocateText({spec, eyes, target, logger}),
      extractText: makeExtractText({spec, eyes, target, logger}),
    })
  }
}
