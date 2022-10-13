import type {RenderSettings, BookedRenderer} from './types'
import {type Logger} from '@applitools/logger'
import {type UFGRequests} from './server/requests'
import * as utils from '@applitools/utils'

export function makeBookRenderer({
  requests,
  batchingTimeout = 100,
  logger,
}: {
  requests: UFGRequests
  batchingTimeout?: number
  logger?: Logger
}) {
  const bookedRendererWithBatching = utils.general.batchify(bookRenderers, {timeout: batchingTimeout})

  return function bookRenderer({settings}: {settings: RenderSettings}) {
    return bookedRendererWithBatching(settings)
  }

  async function bookRenderers(batch: [RenderSettings, {resolve(result: BookedRenderer): void; reject(reason?: any): void}][]) {
    try {
      const bookedRenderers = await requests.bookRenderers({settings: batch.map(([settings]) => settings), logger})
      bookedRenderers.forEach((bookedRenderer, index) => {
        const [, {resolve}] = batch[index]
        resolve(bookedRenderer)
      })
    } catch (err) {
      batch.forEach(([, {reject}]) => reject(err))
    }
  }
}
