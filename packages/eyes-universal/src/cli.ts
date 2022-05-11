#!/usr/bin/env node

import yargs from 'yargs'
import {cli as egCli} from '@applitools/execution-grid-client'
import {makeServerProcess} from './universal-server-process'
import {makeServer} from './universal-server'

yargs
  .example([
    ['eyes-universal', 'Run Eyes Universal server on default port (21077)'],
    ['eyes-universal --fork', 'Run Eyes Universal server in a forked process'],
    ['eyes-universal --port 8080', 'Run Eyes Universal server on port 8080'],
    ['eyes-universal --no-singleton', 'Run Eyes Universal server on a non-singleton mode'],
    ['eyes-universal --lazy', 'Run Eyes Universal server on a lazy mode'],
  ])
  .command({
    command: '*',
    builder: yargs =>
      yargs.options({
        port: {
          description: 'run server on a specific port.',
          alias: 'p',
          type: 'number',
          default: 21077,
        },
        singleton: {
          description:
            'runs server on a singleton mode. It will prevent the server to start in case the same server is already started.',
          alias: 's',
          type: 'boolean',
          default: true,
        },
        lazy: {
          description:
            'runs server on a lazy mode. It will not try to find a free port if the required one is already taken.',
          alias: 'l',
          type: 'boolean',
          default: false,
        },
        fork: {
          description: 'runs server in a forked process.',
          type: 'boolean',
          default: false,
        },
        'idle-timeout': {
          description: 'time in minutes for server to stay responsible in case of idle.',
          type: 'number',
          default: 15,
          coerce: value => value * 60 * 1000,
        },
        config: {
          description: 'json string to use instead of cli arguments',
          type: 'string',
          coerce: JSON.parse,
        },
      }),
    handler: async (args: any) => {
      if (args.fork) {
        const {port} = await makeServerProcess({...args, fork: false})
        console.log(port) // NOTE: this is a part of the generic protocol
      } else {
        makeServer({...args, ...args.config})
      }
    },
  })
  .command({
    command: 'eg-client',
    describe: 'Run EG Client',
    ...(egCli as any),
  })
  .wrap(yargs.terminalWidth()).argv
