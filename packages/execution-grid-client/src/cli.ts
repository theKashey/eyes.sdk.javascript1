#!/usr/bin/env node

import yargs, {type CommandBuilder, type ArgumentsCamelCase} from 'yargs'
import {makeServer, type ServerOptions} from './proxy-server'

export const builder: CommandBuilder<ServerOptions> = yargs =>
  yargs
    .example([
      ['eg-client', 'Run EG client server on random port'],
      ['eg-client --port 8080', 'Run EG client server on port 8080'],
    ])
    .options({
      port: {
        description: 'run server on a specific port.',
        alias: 'p',
        type: 'number',
      },
      serverUrl: {
        description: 'run server with specific default eyes server url.',
        type: 'number',
      },
      apiKey: {
        description: 'run server with specific default api key.',
        type: 'number',
      },
      tunnelUrl: {
        description: 'run server with specific default tunnel url.',
      },
    })

export const handler = async (args: ArgumentsCamelCase<ServerOptions>) => {
  const proxy = await makeServer(args)
  console.log(proxy.url)
}

if (require.main === module) {
  yargs.command({command: '*', builder, handler}).argv
}
