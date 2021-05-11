#!/usr/bin/env node
const yargs = require('yargs')
const extractor = require('../index')

const {argv} = yargs
  .example('$ api-extractor ./index.ts', 'generate "index.d.ts" file with all declarations exported from "index.ts"')
  .command('* [entry]')
  .option('entry', {
    description: 'entry point (main file) to generate .d.ts file from',
    type: 'string',
    default: './index.ts',
  })
  .option('out', {
    description: 'path for generated file should be saved',
    alias: 'o',
    type: 'string',
    default: './index.d.ts',
  })
  .option('tsconfig', {
    description: 'path to tsconfig.json file',
    type: 'string',
    default: './tsconfig.json',
  })
  .option('external-modules', {
    description: 'name of modules to import types instead of inline them',
    type: 'array',
    default: [],
  })
  .option('external-globals', {
    description: 'name of global accessible types/namespaces to keep instead instead of inline them',
    type: 'array',
    default: [],
  })

extractor(argv)
