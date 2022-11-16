const chalk = require('chalk')
const fs = require('fs')

function getCallSite(elevation = 1) {
  const originalPrepareStackTrace = Error.prepareStackTrace
  Error.prepareStackTrace = (_, stack) => stack
  const err = new Error()
  Error.captureStackTrace(err, global)
  const callSite = err.stack[elevation]
  Error.prepareStackTrace = originalPrepareStackTrace
  return callSite
}

function useFramework({fixturesPath = ''} = {}) {
  const context = {
    testsConfig: null,
    tests: {},
  }

  return {
    context,
    api: {
      test: addTest,
      config: setConfig,
      fixture: createFixture,
    },
  }

  function addTest(name, test) {
    const source = {line: getCallSite(2).getLineNumber()}
    if (context.tests.hasOwnProperty(name)) {
      const test = context.tests[name]
      const message = chalk.yellow(
        `WARNING: test with name "${name}" on line ${source.line} overrides the test with same name on line ${test.source.line}`,
      )
      console.log(message)
    }
    test.source = source
    context.tests[name] = test
  }

  function setConfig(config) {
    if (context.testsConfig) {
      const message = chalk.yellow(`WARNING: tests configuration object was reset`)
      console.log(message)
    }
    context.testsConfig = config
  }

  function createFixture(path) {
    if (!fixturesPath) return null
    const fixturePath = new String(fixturesPath + path)
    fixturePath.toPath = () => fixturePath.toString()
    fixturePath.toBase64 = () => fs.readFileSync(fixturePath.toString()).toString('base64')
    fixturePath.toText = () => fs.readFileSync(fixturePath.toString()).toString()
    return fixturePath
  }
}

exports.useFramework = useFramework
