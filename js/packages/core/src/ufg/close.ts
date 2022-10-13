import type {CloseSettings, TestResult} from './types'
import type {Eyes as BaseEyes} from '@applitools/core-base'
import {type Logger} from '@applitools/logger'
import {type Renderer} from '@applitools/ufg-client'

type Options = {
  storage: {renderer: Renderer; promise: Promise<{eyes: BaseEyes; renderer: Renderer}>}[]
  logger: Logger
}

export function makeClose({storage, logger: defaultLogger}: Options) {
  return async function ({
    settings,
    logger = defaultLogger,
  }: {
    settings?: CloseSettings
    logger?: Logger
  } = {}): Promise<TestResult[]> {
    const tests = storage.reduce((tests, {renderer, promise}) => {
      const key = JSON.stringify(renderer)
      const promises = tests.get(key) ?? []
      promises.push(promise)
      return tests.set(key, promises)
    }, new Map<string, Promise<{eyes: BaseEyes; renderer: Renderer}>[]>())

    return Promise.all(
      Array.from(tests.values(), async promises => {
        try {
          const [{eyes, renderer}] = await Promise.all(promises)
          const [result] = await eyes.close({settings, logger})
          return {...result, renderer}
        } catch (error) {
          await error.info?.eyes?.abort({logger})
          throw error
        }
      }),
    )
  }
}
