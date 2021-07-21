const {Builder, By} = require('selenium-webdriver')
const path = require('path')

;(async function main() {
  const extensionPath = process.argv[2] ? process.argv[2] : path.resolve(__dirname, 'dist')
  console.log('loading Eyes browser extension from', extensionPath)

  const driver = await new Builder()
    .withCapabilities({
      browserName: 'chrome',
      'goog:chromeOptions': {
        args: [`--load-extension=${extensionPath}`, `--disable-extensions-except=${extensionPath}`],
      },
    })
    .build()

  await driver.get('https://demo.applitools.com')

  await openEyes({
    appName: 'Demo App - javascript',
    testName: 'Smoke Test',
    apiKey: process.env.APPLITOOLS_API_KEY,
    matchTimeout: 0,
    viewportSize: {width: 800, height: 600},
  })

  await check({name: 'Login Window', fully: true})

  const el = await driver.findElement(By.id('log-in'))
  await el.click()

  await check({name: 'App Window', fully: true})

  const testResults = await close()

  console.log(formatTestResults(testResults))

  await driver.close()

  /******************************/

  function openEyes(config) {
    return driver.executeAsyncScript(
      `__applitools.openEyes({config: arguments[0]}).then(arguments[arguments.length-1])`,
      config,
    )
  }

  function check(settings) {
    return driver.executeAsyncScript(
      `__applitools.eyes.check({settings: arguments[0]}).then(arguments[arguments.length-1])`,
      settings,
    )
  }

  function close() {
    return driver.executeAsyncScript(`return __applitools.eyes.close().then(arguments[arguments.length-1])`)
  }

  /***********************************/

  function formatTestResults({name, status, url, steps, stepsInfo, matches, mismatches, missing, hostDisplaySize}) {
    return `
Test name                 : ${name}
Test status               : ${status}
URL to results            : ${url}
Total number of steps     : ${steps}
Number of matching steps  : ${matches}
Number of visual diffs    : ${mismatches}
Number of missing steps   : ${missing}
Display size              : ${hostDisplaySize.width}x${hostDisplaySize.height}
Steps                     :
${stepsInfo
  .map((step, i) => {
    return `  ${i + 1}. ${step.name} - ${getStepStatus(step)}`
  })
  .join('\n')}`
  }

  function getStepStatus(step) {
    if (step.isDifferent) {
      return 'Diff'
    } else if (!step.hasBaselineImage) {
      return 'New'
    } else if (!step.hasCurrentImage) {
      return 'Missing'
    } else {
      return 'Passed'
    }
  }
})()
