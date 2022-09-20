import type {Renderer} from '@applitools/types'
import type {Eyes as BaseEyes} from '@applitools/types/base'
import type {CloseSettings, TestResult} from '@applitools/types/ufg'
import {type Logger} from '@applitools/logger'

type Options = {
  storage: Promise<{eyes: BaseEyes; renderer: Renderer}>[]
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
    const results = await Promise.allSettled(storage)

    let error
    const eyes = results.reduce((eyes, result) => {
      let value
      if (result.status === 'fulfilled') {
        value = result.value
      } else {
        value = result.reason
        error ??= result.reason
      }

      return eyes.set(value.eyes, value.renderer)
    }, new Map<BaseEyes, Renderer>())

    if (error) {
      await Promise.all(Array.from(eyes.entries(), async ([eyes]) => eyes.abort({logger})))
      throw error
    } else {
      return Promise.all(
        Array.from(eyes.entries(), async ([eyes, renderer]) => {
          const [result] = await eyes.close({settings, logger})
          return {...result, renderer}
        }),
      )
    }
  }
}
