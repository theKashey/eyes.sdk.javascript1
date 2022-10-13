import type {TestResult} from './types'
import type {Eyes as BaseEyes} from '@applitools/core-base'
import {type Logger} from '@applitools/logger'
import {type Renderer} from '@applitools/ufg-client'
import {type AbortController} from 'abort-controller'
import {AbortError} from '../errors/abort-error'

type Options = {
  storage: {renderer: Renderer; promise: Promise<{eyes: BaseEyes; renderer: Renderer}>}[]
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

    const tests = storage.reduce((tests, {renderer, promise}) => {
      const key = JSON.stringify(renderer)
      return tests.set(key, promise)
    }, new Map<string, Promise<{eyes: BaseEyes; renderer: Renderer}>>())

    return Promise.all(
      Array.from(tests.values(), async promise => {
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
