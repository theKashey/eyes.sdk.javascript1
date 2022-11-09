import {type Logger} from '@applitools/logger'
import {type Driver} from '@applitools/driver'
import {lazyLoad as lazyLoadScript} from '@applitools/snippets'

export type LazyLoadSettings = {
  scrollLength?: number
  waitingTime?: number
  maxAmountToScroll?: number
  executionTimeout?: number
  pollTimeout?: number
}

export async function waitForLazyLoad<TDriver extends Driver<unknown, unknown, unknown, unknown>>({
  driver,
  settings,
  logger,
}: {
  driver: TDriver
  settings: LazyLoadSettings
  logger: Logger
}) {
  logger.log('lazy loading the page before capturing a screenshot')
  const arg = {
    scrollLength: settings.scrollLength ?? 300,
    waitingTime: settings.waitingTime ?? 2000,
    maxAmountToScroll: settings.maxAmountToScroll ?? 15000,
  }

  await driver.currentContext.executePoll(lazyLoadScript, {
    main: arg,
    poll: undefined,
    executionTimeout: 5 * 60 * 1000,
    pollTimeout: settings.pollTimeout ?? settings.waitingTime ?? 2000,
  })
}
