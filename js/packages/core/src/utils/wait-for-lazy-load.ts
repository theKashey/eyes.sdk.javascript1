import {type Logger} from '@applitools/logger'
import {type Driver} from '@applitools/driver'
import {lazyLoad as lazyLoadScript} from '@applitools/snippets'
import {executePollScript, type PollScriptSettings} from './execute-poll-script'

export type LazyLoadSettings = Partial<PollScriptSettings> & {
  scrollLength?: number
  waitingTime?: number
  maxAmountToScroll?: number
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

  const scripts = {
    main: {script: lazyLoadScript, args: [[arg]]},
    poll: {script: lazyLoadScript, args: [[]]},
  }
  await executePollScript({
    context: driver.currentContext,
    scripts,
    settings: {executionTimeout: 5 * 60 * 1000, pollTimeout: settings.pollTimeout ?? settings.waitingTime ?? 2000},
    logger,
  })
}
