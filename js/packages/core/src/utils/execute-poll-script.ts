import {type Context} from '@applitools/driver'
import {type Logger} from '@applitools/logger'
import {CoreError} from '@applitools/core-base'
import * as utils from '@applitools/utils'

export type PollScriptSettings = {
  executionTimeout: number
  pollTimeout: number
}

type Script = {script: string; args: any[]}

export async function executePollScript<TContext extends Context<unknown, unknown, unknown, unknown>>({
  context,
  scripts,
  settings,
  logger,
}: {
  context: TContext
  scripts: {main: Script; poll: Script}
  settings: PollScriptSettings
  logger: Logger
}): Promise<any> {
  logger.log('Executing poll script')
  let isExecutionTimedOut = false
  const executionTimer = setTimeout(() => (isExecutionTimedOut = true), settings.executionTimeout)
  try {
    const {script, args = []} = scripts.main
    let response = deserialize(await context.execute(script, ...args))
    let chunks = ''
    while (!isExecutionTimedOut) {
      if (response.status === 'ERROR') {
        throw new CoreError(`Error during execute poll script: '${response.error}'`, {
          reason: 'poll script',
          error: response.error,
        })
      } else if (response.status === 'SUCCESS') {
        return response.value
      } else if (response.status === 'SUCCESS_CHUNKED') {
        chunks += response.value
        if (response.done) return deserialize(chunks)
      } else if (response.status === 'WIP') {
        await utils.general.sleep(settings.pollTimeout)
      }
      logger.log('Polling...')
      const {script, args = []} = scripts.poll
      response = deserialize(await context.execute(script, ...args))
    }
    throw new CoreError('Poll script execution is timed out', {reason: 'timeout'})
  } finally {
    clearTimeout(executionTimer)
  }

  function deserialize(json) {
    try {
      return JSON.parse(json)
    } catch (err) {
      const firstChars = json.slice(0, 100)
      const lastChars = json.slice(-100)
      throw new Error(
        `Response is not a valid JSON string. length: ${json.length}, first 100 chars: "${firstChars}", last 100 chars: "${lastChars}". error: ${err}`,
      )
    }
  }
}
