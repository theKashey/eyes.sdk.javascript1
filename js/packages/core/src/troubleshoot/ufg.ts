import {request as sendRequest} from 'https'
import {createHash} from 'crypto'
import {RENDER_INFO_URL} from './eyes'
import {makeUFGRequests} from '@applitools/ufg-client'
import {config, getProxyCurlArg} from './utils'
import * as utils from '@applitools/utils'
import fetch from 'node-fetch'

const value = Buffer.from(JSON.stringify({resources: {}, domNodes: []}))
const hash = createHash('sha256').update(value).digest('hex')
const contentType = 'x-applitools-html/cdt'
const resource = {
  id: 'id',
  url: 'https://localhost:2107',
  value,
  hash: {hashFormat: 'sha256' as const, hash, contentType},
  contentType,
}

const UFG_PUT_RESOURCE_URL = `https://render-wus.applitools.com/sha256/${resource.hash.hash}?render-id=fake`

const accessTokenPromise = new Promise<string>(async resolve => {
  const {stdout} = await utils.process.execute(`curl -s ${RENDER_INFO_URL} ${getProxyCurlArg()}`, {
    maxBuffer: 10000000,
  })
  const accessToken = JSON.parse(stdout).accessToken
  if (!accessToken) throw new Error('could not receive auth token since cURL command to get it failed.')

  resolve(accessToken)
})

export const getCmd = async () =>
  `curl -X PUT -H "Content-Type: application/json" -H "X-Auth-Token: ${await accessTokenPromise}" -d '${
    resource.value
  }' ${UFG_PUT_RESOURCE_URL} ${getProxyCurlArg()}`

const validateVgResult = (res, sha) => {
  if (!res || res.hash !== sha) {
    throw new Error(`bad VG result ${res}`)
  }
}

export default {
  async testFetch() {
    const response = await fetch(UFG_PUT_RESOURCE_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'x-applitools-html/cdt',
        'X-Auth-Token': await accessTokenPromise,
      },
      body: resource.value,
    })
    const data = await response.json()
    validateVgResult(data, resource.hash.hash)
  },
  async testCurl() {
    // HTTP_PROXY and HTTPS_PROXY are read by cURL.
    let proxyUrl
    if (config.proxy) {
      proxyUrl = new URL(utils.types.isString(config.proxy) ? config.proxy : config.proxy.url)
      if (config.proxy.username) proxyUrl.username = config.proxy.username
      if (config.proxy.password) proxyUrl.password = config.proxy.password
    }
    const {stdout} = await utils.process.execute(await getCmd(), {maxBuffer: 10000000})
    validateVgResult(JSON.parse(stdout), resource.hash.hash)
  },
  testServer: async () => {
    const url = new URL(UFG_PUT_RESOURCE_URL)
    const requests = makeUFGRequests({
      config: {serverUrl: url.origin, accessToken: await accessTokenPromise, uploadUrl: '', stitchingServiceUrl: ''},
      logger: null,
    })
    await requests.uploadResource({resource})
  },
  async testHttps() {
    return new Promise<void>(async (resolve, reject) => {
      const url = new URL(UFG_PUT_RESOURCE_URL)
      const request = sendRequest({
        host: url.host,
        path: `${url.pathname}${url.search}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'x-applitools-html/cdt',
          'X-Auth-Token': await accessTokenPromise,
        },
      })
      request.on('response', response => {
        let data = ''
        response.on('data', chunk => (data += chunk))
        response.on('end', () => {
          try {
            validateVgResult(JSON.parse(data), resource.hash.hash)
            resolve()
          } catch (e) {
            reject(e)
          }
        })
      })
      request.on('error', reject)
      request.write(resource.value)
      request.end()
    })
  },
  url: new URL(UFG_PUT_RESOURCE_URL),
  getCmd,
}
