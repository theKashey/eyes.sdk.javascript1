const {Builder, By} = require('selenium-webdriver')
const path = require('path')

const SAVE_RESULT = `.then(value => __applitools.result = {status: 'SUCCESS', value}).catch(error => __applitools.result = {status: 'ERROR', error: error.message})`
const POLL_RESULT = `
let response = __applitools.result;
delete __applitools.result;
return response;
`
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

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

  try {
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
  } catch (ex) {
    console.log(ex)
  } finally {
    await driver.close()
  }

  /******************************/

  async function openEyes(config) {
    await driver.executeScript(`__applitools.openEyes({config: arguments[0]})${SAVE_RESULT}`, config)
    return pollResult()
  }

  async function check(settings) {
    await driver.executeScript(`__applitools.eyes.check({settings: arguments[0]})${SAVE_RESULT}`, settings)
    return pollResult()
  }

  async function close() {
    await driver.executeScript(`__applitools.eyes.close()${SAVE_RESULT}`)
    return pollResult()
  }

  async function pollResult() {
    let pollResponse
    while (!pollResponse) {
      pollResponse = await driver.executeScript(POLL_RESULT)
      await wait(100)
    }

    if (pollResponse.status === 'SUCCESS') {
      return pollResponse.value
    } else if (pollResponse.status === 'ERROR') {
      throw new Error(pollResponse.error)
    }
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
