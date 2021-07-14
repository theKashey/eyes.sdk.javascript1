const chalk = require('chalk')
const {configLoader} = require('../loaders/config-loader')
const {testsLoader} = require('../loaders/tests-loader')
const {templateLoader} = require('../loaders/template-loader')
const {specEmitterLoader} = require('../loaders/spec-emitter-loader')
const {emitTests} = require('./emit')
const {createTestFiles, createTestMetaData} = require('./save')

const DEFAULT_CONFIG = {
  tests: 'https://raw.githubusercontent.com/applitools/sdk.coverage.tests/master/coverage-tests.js',
}

async function generate(options) {
  try {
    const config = {
      ...DEFAULT_CONFIG,
      ...configLoader(options),
      ...options,
    }

    if (config.env) {
      Object.entries(config.env).forEach(([key, value]) => (process.env[key] = value))
    }

    console.log(`Creating coverage tests for ${config.name}...\n`)

    const tests = await testsLoader(config)

    if (tests.length <= 0) {
      const message = `No test will be emitted. Please check "tests", "emitSkipped", "emitOnly" config parameters`
      console.log(chalk.yellow(message), '\n')
      return
    }

    const makeSpecEmitter = await specEmitterLoader(config)
    const makeFile = await templateLoader(config)

    const {emittedTests, skippedTestCount, skippedEmitTestCount, errors} = emitTests(tests, {
      makeSpecEmitter,
      makeFile,
    })

    if (errors.length > 0) {
      if (config.strict) {
        const [{test, error}] = errors
        console.log(chalk.red(`Error during emitting test "${test.name}":`))
        throw error
      }
      errors.forEach(({test, error}) => {
        console.log(chalk.red(`Error during emitting test "${test.name}":`))
        console.log(chalk.grey(error.stack))
      })
    }

    await createTestFiles(emittedTests, config)
    await createTestMetaData(tests, config)

    console.log(chalk.green(`${chalk.bold(`${emittedTests.length}`.padEnd(3))} test(s) generated`))
    console.log(
      chalk.cyan(`${chalk.bold(`${skippedTestCount}`.padEnd(3))} test(s) skipped execution`),
    )
    console.log(
      chalk.cyan(`${chalk.bold(`${skippedEmitTestCount}`.padEnd(3))} test(s) skipped emit`),
    )
    console.log(chalk.red(`${chalk.bold(`${errors.length}`.padEnd(3))} error(s) occurred`))
  } catch (err) {
    console.log(chalk.red(err.stack))
    process.exit(1)
  }
}

module.exports = generate
