import type {Renderer} from '@applitools/types'
import type {Eyes as BaseEyes} from '@applitools/types/base'
import type {TestResult} from '@applitools/types/ufg'
import {type Logger} from '@applitools/logger'
import {type AbortController} from 'abort-controller'
import {AbortError} from '../errors/abort-error'

type Options = {
  storage: Promise<{eyes: BaseEyes; renderer: Renderer}>[]
  controller: AbortController
  logger: Logger
}

export function makeAbort({storage, controller, logger: defaultLogger}: Options) {
  return async function ({
    logger = defaultLogger,
  }: {
    logger?: Logger
  } = {}): Promise<TestResult[]> {
    controller.abort()

    return Promise.all(
      storage.map(async promise => {
        let eyes: BaseEyes, renderer: Renderer
        try {
          const value = await promise
          eyes = value.eyes
          renderer = value.renderer
        } catch (error) {
          eyes = error.info.eyes
          renderer = error.info.renderer
          if (!eyes) {
            if (error instanceof AbortError) return error.info
            else throw error
          }
        }
        const [result] = await eyes.abort({logger})
        return {...result, renderer} as TestResult
      }),
    )
  }
}
