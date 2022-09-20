import {type Logger} from '@applitools/logger'
import {type ContentfulResource} from './resource'
import {type UFGRequests} from './server/requests'
import * as utils from '@applitools/utils'
import throat from 'throat'

export type UploadResource = (options: {resource: ContentfulResource}) => Promise<void>

export function makeUploadResource({
  requests,
  batchingTimeout = 300,
  concurrency = 100,
  logger,
}: {
  requests: UFGRequests
  batchingTimeout?: number
  concurrency?: number
  logger?: Logger
}): UploadResource {
  const uploadedResources = new Set<string>()
  const requestedResources = new Map<string, Promise<void>>()
  const uploadResourceWithConcurrency = throat(concurrency, requests.uploadResource)
  const uploadResourceWithBatching = utils.general.batchify(uploadResources, {timeout: batchingTimeout})

  return async function uploadResource({resource}: {resource: ContentfulResource}): Promise<void> {
    const hash = resource.hash.hash
    if (uploadedResources.has(hash)) {
      return Promise.resolve()
    } else if (requestedResources.has(hash)) {
      return requestedResources.get(hash)
    } else {
      const promise = uploadResourceWithBatching(resource)
        .then(result => {
          uploadedResources.add(hash)
          return result
        })
        .finally(() => {
          requestedResources.delete(hash)
        })
      requestedResources.set(hash, promise)
      return promise
    }
  }

  async function uploadResources(batch: [ContentfulResource, {resolve(): void; reject(reason?: any): void}][]) {
    try {
      const presentedResources = await requests.checkResources({resources: batch.map(([resource]) => resource), logger})

      presentedResources.forEach((presented, index) => {
        const [resource, {resolve, reject}] = batch[index]
        if (presented) {
          resolve()
        } else {
          uploadResourceWithConcurrency({resource, logger}).then(resolve, reject)
        }
      })
    } catch (err) {
      batch.forEach(([, {reject}]) => reject(err))
    }
  }
}
