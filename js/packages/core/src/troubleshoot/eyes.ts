import {get as sendGetRequest} from 'https'
import {makeCoreRequests} from '@applitools/core-base'
import {config, getProxyCurlArg} from './utils'
import * as utils from '@applitools/utils'
import fetch from 'node-fetch'

export const RENDER_INFO_URL = `${config.serverUrl}/api/sessions/renderinfo?apiKey=${config.apiKey}`

export const CURL_CMD = `curl ${RENDER_INFO_URL} ${getProxyCurlArg()}`

const validateRawAccountInfo = res => {
  if (!res || !res.accessToken || !res.resultsUrl) {
    throw new Error(`bad render info result ${JSON.stringify(res)}`)
  }
}

const validateAccountInfo = res => {
  if (!res || !res.ufg || !res.ufg.accessToken || !res.uploadUrl) {
    throw new Error(`bad render info result ${JSON.stringify(res)}`)
  }
}

export default {
  async testFetch() {
    const response = await fetch(RENDER_INFO_URL)
    const data = await response.json()
    validateRawAccountInfo(data)
  },
  async testCurl() {
    const {stdout} = await utils.process.execute(CURL_CMD, {
      maxBuffer: 10000000,
    })
    const data = JSON.parse(stdout)
    validateRawAccountInfo(data)
  },
  async testServer() {
    const server = makeCoreRequests({agentId: 'check-network'})
    const result = await server.getAccountInfo({settings: config})
    validateAccountInfo(result)
  },
  testHttps: async () => {
    return new Promise<void>((resolve, reject) => {
      const request = sendGetRequest(RENDER_INFO_URL, response => {
        let data = ''
        response.on('data', chunk => (data += chunk))
        response.on('end', () => {
          try {
            validateRawAccountInfo(JSON.parse(data))
            resolve()
          } catch (err) {
            reject(err)
          }
        })
      })
      request.on('error', reject)
    })
  },
  url: new URL(RENDER_INFO_URL),
  cmd: CURL_CMD,
}
