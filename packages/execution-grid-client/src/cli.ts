#!/usr/bin/env node

import yargs from 'yargs'
import {makeServer} from './proxy-server'

yargs
  .example([
    ['$ eg-client', 'Run Eyes Universal server on random port'],
    ['$ eg-client --port 8080', 'Run Eyes Universal server on port 8080'],
  ])
  .command({
    command: '*',
    builder: yargs =>
      yargs.options({
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
      }),
    handler: async args => {
      const proxy = await makeServer(args as any)
      console.log(proxy.url)
    },
  }).argv
