const {Given, Then, setDefaultTimeout, AfterAll, BeforeAll} = require('cucumber')
const {createSession, closeSession, startWebDriver, stopWebDriver} = require('nightwatch-api')
const path = require('path')
const {client} = require('nightwatch-api')
const {Target} = require('../../../../')
const Nightwatch = require('nightwatch')
let browser

setDefaultTimeout(100000)
BeforeAll(async () => {
  if (process.env.APPLITOOLS_NIGHTWATCH_MAJOR_VERSION === '1') {
    await startWebDriver({
      env: process.env.NIGHTWATCH_ENV || 'default',
      configFile: path.join(__dirname, '../../nightwatch.conf.js'),
    })
    await createSession()
    browser = client
  } else {
    const client = await Nightwatch.createClient({
      env: process.env.NIGHTWATCH_ENV || 'default',
      config: path.join(__dirname, '../../nightwatch.conf.js'),
    })
    browser = await client.launchBrowser()
  }
})

AfterAll(async () => {
  if (process.env.APPLITOOLS_NIGHTWATCH_MAJOR_VERSION === '1') {
    await closeSession()
    await stopWebDriver()
  } else {
    await browser.end()
  }
})

Given(/^I open Applitools`s demo page$/, async () => {
  await browser.url('https://applitools.github.io/demo/')
})

Then(/^visual test Demo$/, async () => {
  await browser.eyesOpen('demo', 'eyes-nightwatch cucumber').eyesCheck(Target.window().fully()).eyesClose()
})

Then(/^the button exists$/, async () => {
  await browser.assert.visible('.button-section')
})
