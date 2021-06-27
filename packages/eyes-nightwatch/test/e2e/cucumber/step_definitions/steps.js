const {Given, Then, setDefaultTimeout} = require('cucumber')
const {client} = require('nightwatch-api')
const {Target} = require('../../../../')

setDefaultTimeout(100000)

Given(/^I open Google`s search page$/, async () => {
  await client.url('http://google.com')
})

Then(/^visual test Google$/, async () => {
  await client.eyesOpen('google', 'eyes-nightwatch cucumber').eyesCheck(Target.window().fully()).eyesClose()
})

Then(/^the Google search form exists$/, async () => {
  await client.assert.visible('input[name="q"]')
})
