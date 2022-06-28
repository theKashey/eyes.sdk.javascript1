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
      egTunnelUrl: {
        description: 'run server with specific eg tunnel url.',
        type: 'string',
      },
      egTimeout: {
        description: 'run server with specific default eg timeout.',
        alias: 'timeout',
        type: 'number',
      },
      egInactivityTimeout: {
        description: 'run server with specific default eg inactivity timeout.',
        alias: 'inactivityTimeout',
        type: 'number',
      },
      proxyUrl: {
        description: 'run server with specific default proxy url.',
        alias: 'proxy',
        type: 'string',
      },
      eyesServerUrl: {
        description: 'run server with specific default eyes server url.',
        alias: 'serverUrl',
        type: 'string',
      },
      apiKey: {
        description: 'run server with specific default api key.',
        type: 'string',
      },
    })

export const handler = async (args: ArgumentsCamelCase<ServerOptions>) => {
  const proxy = await makeServer(args)
  console.log(proxy.url)
}

if (require.main === module) {
  yargs.command({command: '*', builder, handler}).argv
}
