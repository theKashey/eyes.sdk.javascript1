#!/usr/bin/env node

import yargs from 'yargs'
import {makeServerProcess} from './universal-server-process'
import {makeServer} from './universal-server'
import * as egCli from '@applitools/execution-grid-client/dist/cli'

yargs
  .example([
    ['eyes-universal', 'Run Eyes Universal server on default port (21077)'],
    ['eyes-universal --fork', 'Run Eyes Universal server in a forked process'],
    ['eyes-universal --port 8080', 'Run Eyes Universal server on port 8080'],
    ['eyes-universal --no-singleton', 'Run Eyes Universal server on a non-singleton mode'],
    ['eyes-universal --shutdown-mode stdin', 'Run Eyes Universal server which will close once stdin stream will end'],
  ])
  .command({
    command: '*',
    builder: yargs =>
      yargs.options({
        port: {
          description: 'run server on a specific port.',
          type: 'number',
          default: 21077,
        },
        singleton: {
          description:
            'runs server on a singleton mode. It will prevent the server to start in case the same server is already started.',
          type: 'boolean',
          default: true,
        },
        fork: {
          description: 'runs server in a forked process.',
          type: 'boolean',
          default: false,
        },
        debug: {
          description: 'runs server in a debug mode.',
          type: 'boolean',
          default: false,
        },
        'port-resolution-mode': {
          describe:
            'preferred algorithm to solve port collisions.\n"lazy" mode will not try find free port.\n"random" mode will run on a random port.\n"next" mode will run on next free port after the given one.',
          alias: 'port-resolution',
          type: 'string',
          default: 'next',
        },
        'shutdown-mode': {
          describe:
            'preferred algorithm to automatically kill the process.\n"lazy" mode will end the process once the idle timeout ran out after the last client is disconnected from the server.\n"stdin" mode will end the process once its stdin stream got to its end.',
          alias: 'shutdown',
          type: 'string',
          default: 'lazy',
        },
        'idle-timeout': {
          description: 'time in minutes for server to stay responsible in case of idle.',
          type: 'number',
          default: 15,
          coerce: value => value * 60 * 1000,
        },
        cert: {
          description: 'path to the certificate file.',
          alias: 'cert-path',
          type: 'string',
          implies: 'key',
        },
        key: {
          description: 'path to the key file.',
          alias: 'key-path',
          type: 'string',
          implies: 'cert',
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
