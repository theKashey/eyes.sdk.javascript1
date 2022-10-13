import {type Logger} from '@applitools/logger'
import globalReq, {makeReq, Response, type Req, type Options, type Proxy, type Hooks} from '@applitools/req'

export type ReqBrokerConfig = {
  proxy?: Proxy
  agentId?: string
}

export type ReqBrokerOptions = Options & {
  name: string
  body: {
    protocolVersion: '1.0'
    name: string
    key: string
    payload: Record<string, any>
  }
  logger?: Logger
}

export type ReqBroker = Req<ReqBrokerOptions>

export function makeReqBroker({config, logger}: {config: ReqBrokerConfig; logger?: Logger}) {
  return makeReq<ReqBrokerOptions>({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': config.agentId,
    },
    proxy: config.proxy,
    timeout: 300000 /* 5min */,
    retry: {
      limit: 5,
      timeout: 200,
      codes: ['ECONNRESET', 'ECONNABORTED', 'ETIMEDOUT', 'ENOTFOUND', 'EAI_AGAIN'],
    },
    hooks: [handleLogs({logger}), handleLongRequests({req: globalReq}), handleUnexpectedResponse()],
  })
}

function handleLogs({logger: defaultLogger}: {logger?: Logger} = {}): Hooks<ReqBrokerOptions> {
  return {
    beforeRequest({request, options}) {
      const logger = options.logger ?? defaultLogger
      logger?.log(
        `Broker request "${options.name}" will be sent to the address "[${request.method}]${request.url}" with body`,
        options.body,
      )
    },
    async afterResponse({request, response, options}) {
      const logger = options.logger ?? defaultLogger
      logger?.log(
        `Broker request "${options.name}" that was sent to the address "[${request.method}]${request.url}" respond with ${response.statusText}(${response.status})`,
        response.status !== 200 ? `and body ${JSON.stringify(await response.clone().text())}` : '',
      )
    },
    afterError({request, error, options}) {
      const logger = options.logger ?? defaultLogger
      logger?.error(
        `Broker request "${options.name}" that was sent to the address "[${request.method}]${request.url}" failed with error`,
        error,
      )
    },
  }
}

function handleLongRequests({req}: {req: Req}): Hooks {
  return {
    async afterResponse({request, response, options}) {
      if (response.status === 200) {
        return req(request.url + '-response', {
          proxy: options.proxy,
          retry: {statuses: [404]},
        })
      }
    },
  }
}

function handleUnexpectedResponse(): Hooks {
  return {
    async afterResponse({response}) {
      if (response.status !== 200) {
        throw new Error(
          `Something went wrong when communicating with the mobile application, please try running your test again (error code: ${response.status})`,
        )
      } else {
        const body = await response.text()
        const result = JSON.parse(body)
        if (result?.payload?.error) {
          const error = result.payload.error
          throw new Error(
            `There was a problem when interacting with the mobile application. The provided error message was "${error.message}" and had a stack trace of "${error.stack}"`,
          )
        }
        return new Response(body, response)
      }
    },
  }
}
