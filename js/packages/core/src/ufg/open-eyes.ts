import type {SpecDriver} from '@applitools/types'
import type {Core as BaseCore} from '@applitools/types/base'
import type {Eyes, Target, OpenSettings, TestInfo} from '@applitools/types/ufg'
import {type Logger} from '@applitools/logger'
import {AbortController} from 'abort-controller'
import {makeDriver} from '@applitools/driver'
import {makeUFGClient, type UFGClient} from '@applitools/ufg-client'
import {makeCheck} from './check'
import {makeCheckAndClose} from './check-and-close'
import {makeClose} from './close'
import {makeAbort} from './abort'
import * as utils from '@applitools/utils'

type Options<TDriver, TContext, TElement, TSelector> = {
  core: BaseCore
  client?: UFGClient
  spec?: SpecDriver<TDriver, TContext, TElement, TSelector>
  logger?: Logger
}

export function makeOpenEyes<TDriver, TContext, TElement, TSelector>({
  spec,
  core,
  client,
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
    on?: any
  }): Promise<Eyes<TDriver, TElement, TSelector>> {
    logger.log(`Command "openEyes" is called with ${spec?.isDriver(target) ? 'default driver and' : ''} settings`, settings)

    if (spec?.isDriver(target)) {
      const driver = await makeDriver({spec, driver: target, logger, customConfig: {disableHelper: true}})

      if (settings.environment?.viewportSize) {
        await driver.setViewportSize(settings.environment.viewportSize)
      }
    }

    const account = await core.getAccountInfo({settings, logger})
    const test = {
      userTestId: settings.userTestId,
      batchId: settings.batch?.id,
      server: {serverUrl: settings.serverUrl, apiKey: settings.apiKey, proxy: settings.proxy},
      account,
    } as TestInfo
    client ??= makeUFGClient({config: {...account.ufg, ...account}, concurrency: settings.renderConcurrency ?? 5, logger})

    const controller = new AbortController()

    // get eyes per environment
    const getEyes = utils.general.cachify(async ({rawEnvironment}) => {
      const eyes = await core.openEyes({settings: {...settings, environment: {rawEnvironment}}, logger})
      const aborted = makeHolderPromise()
      const queue = []
      eyes.check = utils.general.wrap(eyes.check, async (check, options) => {
        const index = (options.settings as any).index
        queue[index] ??= makeHolderPromise()
        if (index > 0) await Promise.race([(queue[index - 1] ??= makeHolderPromise()), aborted])
        return check(options).finally(queue[index].resolve)
      })
      eyes.abort = utils.general.wrap(eyes.abort, async (abort, options) => {
        aborted.reject(new Error('Command "check" was aborted due to possible error in previous step'))
        return abort(options)
      })
      return eyes
    })

    const storage = []
    let index = 0
    // check with indexing and storage
    const check = utils.general.wrap(
      makeCheck({spec, getEyes, client, signal: controller.signal, test, target, logger}),
      async (check, options) => {
        ;(options.settings as any).index = index++
        const results = await check(options)
        storage.push(...results.map(result => result.promise))
        return results
      },
    )

    let closed = false
    // close only once
    const close = utils.general.wrap(makeClose({storage, logger}), async (close, options) => {
      if (closed || aborted) return []
      closed = true
      return close(options)
    })

    let aborted = false
    // abort only once
    const abort = utils.general.wrap(makeAbort({storage, controller, logger}), async (abort, options) => {
      if (aborted || closed) return []
      aborted = true
      return abort(options)
    })

    return {
      test,
      get running() {
        return !closed && !aborted
      },
      get closed() {
        return closed
      },
      get aborted() {
        return aborted
      },
      check,
      checkAndClose: makeCheckAndClose({spec, getEyes, client, test, target, logger}),
      close,
      abort,
    }
  }
}

function makeHolderPromise(): PromiseLike<void> & {resolve(): void; reject(reason?: any): void} {
  let promise: Promise<void>
  let resolve: () => void
  let reject: (reason: any) => void
  let result: {status: 'fulfilled'} | {status: 'rejected'; reason: any}
  return {
    then(onFulfilled, onRejected) {
      if (!promise) {
        promise = new Promise<void>((...args) => ([resolve, reject] = args))
        if (result.status === 'fulfilled') resolve()
        else if (result.status === 'rejected') reject(result.reason)
      }
      return promise.then(onFulfilled, onRejected)
    },
    resolve() {
      if (resolve) resolve()
      else result ??= {status: 'fulfilled'}
    },
    reject(reason) {
      if (reject) reject(reason)
      else result ??= {status: 'rejected', reason}
    },
  }
}
