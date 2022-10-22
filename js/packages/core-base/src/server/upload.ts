import {type Logger} from '@applitools/logger'
import {req, type Proxy} from '@applitools/req'
import {gzipSync} from 'zlib'
import * as utils from '@applitools/utils'

export type Upload = (options: {name: string; resource: Buffer | string; gzip?: boolean}) => Promise<string>

export function makeUpload({config, logger}: {config: {uploadUrl: string; proxy?: Proxy}; logger?: Logger}): Upload {
  return async function upload({name, resource, gzip}) {
    logger.log(`Upload called for ${name} resource`)
    if (utils.types.isNull(resource) || utils.types.isHttpUrl(resource)) return resource
    const url = config.uploadUrl.replace('__random__', utils.general.guid())
    const body = gzip ? gzipSync(resource) : Buffer.from(resource)
    const response = await req(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/octet-stream',
        Date: new Date().toISOString(),
        'x-ms-blob-type': 'BlockBlob',
      },
      body,
      proxy: config.proxy,
      retry: {
        limit: 5,
        timeout: 500,
        statuses: [404, 500, 502, 503, 504],
        codes: ['ECONNRESET', 'ECONNABORTED', 'ETIMEDOUT', 'ENOTFOUND', 'EAI_AGAIN'],
      },
      hooks: {
        beforeRetry({response, error, attempt}) {
          logger.warn(
            `Upload of ${name} resource will be retried due to ${
              error ? `an error with message "${error.message}"` : `unexpected status ${response.statusText}(${response.status})`
            } in previous attempt (${attempt})`,
          )
        },
      },
    })
    if (response.status !== 201) {
      throw new Error(`Upload of ${name} resource failed due to unexpected status ${response.statusText}(${response.status})`)
    }
    logger.log(`Upload of ${name} resource finished successfully in location`, url)
    return url
  }
}
