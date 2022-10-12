import {type Logger} from '@applitools/logger'
import {type AbortSignal} from 'abort-controller'
import {type UFGRequests, type RenderRequest, type StartedRender, type RenderResult} from './server/requests'
import * as utils from '@applitools/utils'
import throat from 'throat'

export type Render = (options: {request: RenderRequest; signal?: AbortSignal}) => Promise<RenderResult>

export function makeRender({
  requests,
  concurrency,
  timeout = 60 * 60 * 1000,
  batchingTimeout = 300,
  logger,
}: {
  requests: UFGRequests
  concurrency?: number
  timeout?: number
  batchingTimeout?: number
  logger?: Logger
}): Render {
  const startRenderWithBatching = utils.general.batchify(startRenders, {timeout: batchingTimeout})
  const checkRenderResultWithBatching = utils.general.batchify(checkRenderResults, {timeout: batchingTimeout})
  const renderWithConcurrency = concurrency ? throat(concurrency, render) : render

  return renderWithConcurrency

  async function render({request, signal}: {request: RenderRequest; signal?: AbortSignal}) {
    const timedOutAt = Date.now() + timeout
    const render = await startRenderWithBatching(request)
    return checkRenderResultWithBatching({render, signal, timedOutAt})
  }

  async function startRenders(batch: [RenderRequest, {resolve(result: StartedRender): void; reject(reason?: any): void}][]) {
    try {
      const renders = await requests.startRenders({requests: batch.map(([request]) => request), logger})

      renders.forEach((render, index) => {
        const [, {resolve, reject}] = batch[index]
        if (render.status === 'need-more-resources') {
          logger?.error(`Got unexpected status ${render.status} in start render response`)
          reject(new Error(`Got unexpected status ${render.status} in start render response`))
        } else {
          resolve(render)
        }
      })
    } catch (err) {
      batch.forEach(([, {reject}]) => reject(err))
    }
  }

  async function checkRenderResults(
    batch: [
      {render: StartedRender; signal: AbortSignal; timedOutAt: number},
      {resolve(result: RenderResult): void; reject(reason?: any): void},
    ][],
  ) {
    try {
      batch = batch.filter(([{render, signal, timedOutAt}, {reject}]) => {
        if (signal?.aborted) {
          logger?.warn(`Render with id "${render.renderId}" aborted`)
          reject(new Error(`Render with id "${render.renderId}" aborted`))
          return false
        } else if (Date.now() >= timedOutAt) {
          logger?.error(`Render with id "${render.renderId}" timed out`)
          reject(new Error(`Render with id "${render.renderId}" timed out`))
          return false
        } else {
          return true
        }
      })
      const results = await requests.checkRenderResults({renders: batch.map(([{render}]) => render), logger})
      results.forEach((result, index) => {
        const [{render, signal, timedOutAt}, {resolve, reject}] = batch[index]
        if (result.status === 'error') {
          logger?.error(`Render with id "${render.renderId}" failed due to an error - ${result.error}`)
          reject(new Error(`Render with id "${render.renderId}" failed due to an error - ${result.error}`))
        } else if (result.status === 'rendered') {
          resolve(result)
        } else {
          // NOTE: this may create a long promise chain
          checkRenderResultWithBatching({render, signal, timedOutAt}).then(resolve, reject)
        }
      })
    } catch (err) {
      batch.forEach(([, {reject}]) => reject(err))
    }
  }
}
