#!/usr/bin/env node

const yargs = require('yargs')
const generate = require('./generate/command')
const report = require('./report/command')

const cliName = 'SAT - SDK Agnostic Test-framework'

const cli = yargs
  .usage(cliName)
  .command({
    command: 'generate [config]',
    description: 'create test files for a given SDK configuration',
    builder: yargs =>
      yargs.options({
        config: {
          alias: ['c', 'configPath'],
          description: 'path to the sdk configuration .js file',
          type: 'string',
          default: './test/coverage/index.js',
        },
        tests: {
          alias: ['t', 'testsPath'],
          description: 'path to the tests file (local or remote)',
          type: 'string',
        },
        template: {
          alias: ['templatePath'],
          description: 'path to the template .hbs file (local or remote)',
          type: 'string',
        },
        spec: {
          alias: ['s', 'specPath'],
          description: 'path to the spec emitter definition file (local or remote)',
          type: 'string',
        },
        overrides: {
          alias: ['overridesPath'],
          description: 'path to the tests overrides file (local or remote)',
          type: 'string',
        },
        outDir: {
          alias: ['o', 'out', 'outPath'],
          description: 'path to save generated files',
          type: 'string',
        },
        metaDir: {
          alias: ['m', 'metaPath'],
          description: 'path to save metadata file',
          type: 'string',
        },
        emitSkipped: {
          description: 'whether to create tests that are marked as skipped',
          type: 'boolean',
          default: true,
        },
        emitOnly: {
          alias: ['only'],
          description: 'name of the test to emit',
          type: 'array',
        },
        ignoreSkip: {
          description: 'ignore skip flag',
          type: 'boolean',
        },
        ignoreSkipEmit: {
          description: 'ignore skip emit flag',
          type: 'boolean',
        },
        pascalizeTests: {
          description: 'save tests metadata with pascalized keys',
          type: 'boolean',
          default: false,
        },
        strict: {
          description: 'whether to throw an error if test emitting is failed',
          type: 'boolean',
          default: false,
        },
        name: {
          alias: 'n',
          description: 'the sdk name',
          type: 'string',
        },
        ext: {
          alias: 'e',
          description: 'extension for generated files (e.g. ".spec.js")',
          type: 'string',
        },
      }),
    handler: generate,
  })
  .command({
    command: 'report [config]',
    description: 'send a report to QA dashboard',
    builder: yargs =>
      yargs.options({
        config: {
          alias: ['c', 'configPath'],
          description: 'path to the sdk configuration .js file',
          type: 'string',
          default: './test/coverage/index.js',
        },
        name: {
          alias: ['n'],
          description: 'the sdk name',
          type: 'string',
        },
        resultDir: {
          alias: ['r', 'resultPath'],
          description: 'path to the junit xml file',
          type: 'string',
        },
        metaDir: {
          alias: ['m', 'metaPath'],
          description: 'path to the json metadata file generated with tests',
          type: 'string',
        },
        reportId: {
          alias: ['id'],
          describe: 'id of the report which will be displayed at the dashboard',
        },
        sandbox: {
          description: `send a result report to the sandbox QA dashboard instead of prod`,
        },
      }),
    handler: report,
  })
  .demandCommand(1, 'You need to specify a command before moving on')

cli.argv
