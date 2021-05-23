// https://trello.com/c/FGmYqjCo
const {setupEyes} = require('@applitools/test-utils')
const eyes = setupEyes({vg: true})

fixture`baseline branch name config`.page('https://applitools.com/helloworld')

test.skip('works', async t => {
  await eyes.open({
    appName: 'eyes-testcafe',
    testName: 'baseline branch name config works',
    baselineBranchName: 'branchDoesntExist',
    browser: [{width: 1920, height: 1280, name: 'chrome'}],
    t,
  })
  await eyes.checkWindow('Main Page')
  await eyes.close()
})
