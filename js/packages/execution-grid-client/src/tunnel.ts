import fetch, {Request, Headers} from 'node-fetch'
import {type Logger} from '@applitools/logger'
import * as utils from '@applitools/utils'

const RETRY_ERROR_CODES = ['CONCURRENCY_LIMIT_REACHED', 'NO_AVAILABLE_TUNNEL_PROXY']

const RETRY_BACKOFF = [].concat(
  Array(5).fill(2000), // 5 tries with delay 2s (total 10s)
  Array(4).fill(5000), // 4 tries with delay 5s (total 20s)
  10000, // all next tries with delay 10s
)

export function makeTunnelManager({egTunnelUrl, logger}: {egTunnelUrl?: string; logger: Logger}) {
  return {createTunnel, deleteTunnel}

  async function createTunnel({eyesServerUrl, apiKey}: {eyesServerUrl?: string; apiKey: string}): Promise<string> {
    const request = new Request(`${egTunnelUrl}/tunnels`, {
      method: 'POST',
      headers: new Headers({
        'x-eyes-api-key': apiKey,
        ...(eyesServerUrl ? {'x-eyes-server-url': eyesServerUrl} : {}),
      }),
    })

    let attempt = 0
    while (true) {
      const response = await fetch(request)

      const body: any = await response.json().catch(() => null)
      if (response.status === 201) return body

      if (!RETRY_ERROR_CODES.includes(body?.message) && response.status >= 400 && response.status < 500) {
        logger.error(
          `Failed to create tunnel with status ${response.status} and code ${body?.message ?? 'UNKNOWN_ERROR'}`,
        )
        throw new Error(`Failed to create tunnel with code ${body?.message ?? 'UNKNOWN_ERROR'}`)
      }

      logger.log(`Failed to create tunnel with code ${body.message}. Retrying...`)

      await utils.general.sleep(RETRY_BACKOFF[Math.min(attempt, RETRY_BACKOFF.length - 1)])
      attempt += 1
    }
  }

  async function deleteTunnel({
    tunnelId,
    eyesServerUrl,
    apiKey,
  }: {
    tunnelId: string
    eyesServerUrl?: string
    apiKey: string
  }): Promise<void> {
    const request = new Request(`${egTunnelUrl}/tunnels/${tunnelId}`, {
      method: 'DELETE',
      headers: new Headers({
        'x-eyes-api-key': apiKey,
        ...(eyesServerUrl ? {'x-eyes-server-url': eyesServerUrl} : {}),
      }),
    })

    let attempt = 0
    while (true) {
      const response = await fetch(request)

      if (response.status === 200) return

      if (response.status >= 400 && response.status < 500) {
        const body: any = await response.json().catch(() => null)
        logger.error(
          `Failed to delete tunnel with status ${response.status} and code ${body?.message ?? 'UNKNOWN_ERROR'}`,
        )
        throw new Error(`Failed to delete tunnel with code ${body?.message ?? 'UNKNOWN_ERROR'}`)
      }
      await utils.general.sleep(RETRY_BACKOFF[Math.min(attempt, RETRY_BACKOFF.length - 1)])
      attempt += 1
    }
  }
}
