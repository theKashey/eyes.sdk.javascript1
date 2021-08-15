const spec = require('../../../../../eyes-selenium/dist/spec-driver')
const checkSpecDriver = require('../../../../lib/new/debug/check-spec-driver')
const chalk = require('chalk')

;(async function main() {
  const [driver, destroyDriver] = await spec.build({browser: 'chrome', headless: true})
  const results = await checkSpecDriver({spec, driver})
  await destroyDriver()

  let errCount = 0
  results.forEach(result => {
    if (result.error) {
      console.log(chalk.red(`${++errCount})`), result.test)
      console.log(`\t${result.error.message}`)
      console.log(`\texpected:`, result.error.expected)
      console.log(`\tactual:`, result.error.actual)
    } else {
      console.log(chalk.green('✓'), result.test)
    }
  })
})()
