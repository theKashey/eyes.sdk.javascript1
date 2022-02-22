const assert = require('assert')
const path = require('path')
const fs = require('fs')
const utils = require('@applitools/utils')
const {getTestInfo} = require('@applitools/test-utils')
const {Eyes, TestResultsSummary} = require('../../dist')
const eyes = new Eyes()
process.env.APPLITOOLS_BATCH_NAME = 'JS Coverage Tests - eyes-testcafe (legacy API)'
process.env.APPLITOOLS_BATCH_ID = utils.general.guid()

// TODO
// improve a11y test? https://github.com/applitools/eyes-testcafe/blob/master/tests/e2e/testcafe-tests/accessibility.testcafe.js
// check coverage tests for the following cases:
// - dev emulation
// - multi browser (e.g., browser-one, etc.)
fixture`legacy vg api`.after(async () => {
  if (eyes.getIsOpen()) await eyes.close(false)
})
test('is vg', () => {
  assert.strictEqual(eyes.getRunner().constructor.name, 'VisualGridRunner')
})
test('eyes.open with init params', async driver => {
  await assert.doesNotReject(eyes.open({t: driver, appName: 'app-name', testName: 'test-name'}))
})
test('eyes.checkWindow tag', async t => {
  await t.navigateTo('https://applitools.github.io/demo/TestPages/FramesTestPage/')
  await eyes.open({t, appName: 'eyes-testcafe', testName: 'legacy api test: checkWindow tag'})
  await eyes.checkWindow('tag')
  await eyes.checkWindow({tag: 'tag'})
  const result = await eyes.close(false)
  const info = await getTestInfo(result, process.env.APPLITOOLS_API_KEY)
  assert.deepStrictEqual(info['actualAppOutput']['0'].tag, 'tag')
})
test('eyes.checkWindow fully (implicit default)', async t => {
  await t.navigateTo('https://applitools.github.io/demo/TestPages/FramesTestPage/')
  await eyes.open({t, appName: 'eyes-testcafe', testName: 'legacy api test: checkWindow fully'})
  await eyes.checkWindow()
  await eyes.close(true)
})
test('eyes.checkWindow fully (target: window)', async t => {
  await t.navigateTo('https://applitools.github.io/demo/TestPages/FramesTestPage/')
  await eyes.open({t, appName: 'eyes-testcafe', testName: 'legacy api test: checkWindow fully'})
  await eyes.checkWindow({target: 'window'})
  await eyes.close(true)
})
test('eyes.checkWindow fully (target: window, fully: true)', async t => {
  await t.navigateTo('https://applitools.github.io/demo/TestPages/FramesTestPage/')
  await eyes.open({t, appName: 'eyes-testcafe', testName: 'legacy api test: checkWindow fully'})
  await eyes.checkWindow({target: 'window', fully: true})
  await eyes.close(true)
})
test('eyes.checkWindow selector (css)', async t => {
  await t.navigateTo('https://applitools.github.io/demo/TestPages/FramesTestPage/')
  await eyes.open({t, appName: 'eyes-testcafe', testName: 'legacy api test: checkWindow selector'})
  await eyes.checkWindow({target: 'region', selector: '#overflowing-div'})
  await eyes.close(true)
})
test('eyes.checkWindow selector (xpath)', async t => {
  await t.navigateTo('https://applitools.github.io/demo/TestPages/FramesTestPage/')
  await eyes.open({t, appName: 'eyes-testcafe', testName: 'legacy api test: checkWindow xpath'})
  await eyes.checkWindow({target: 'region', selector: {type: 'xpath', selector: '/html/body/div'}})
  await eyes.close(true)
})
test('eyes.checkWindow region', async t => {
  await t.navigateTo('https://applitools.github.io/demo/TestPages/FramesTestPage/')
  await eyes.open({t, appName: 'eyes-testcafe', testName: 'legacy api test: checkWindow region'})
  await eyes.checkWindow({target: 'region', region: {top: 100, left: 0, width: 1000, height: 200}})
  await eyes.close(true)
})
test('eyes.checkWindow ignore', async t => {
  await t.navigateTo('https://applitools.github.io/demo/TestPages/FramesTestPage/')
  await eyes.open({t, appName: 'eyes-testcafe', testName: 'legacy api test: checkWindow ignore'})
  await eyes.checkWindow({
    ignore: [{selector: '#overflowing-div'}, {top: 100, left: 0, width: 1000, height: 200}],
  })
  await eyes.close(true)
})
test('eyes.checkWindow floating', async t => {
  await t.navigateTo('https://applitools.github.io/demo/TestPages/FramesTestPage/')
  await eyes.open({t, appName: 'eyes-testcafe', testName: 'legacy api test: checkWindow floating'})
  await eyes.checkWindow({
    floating: [
      {
        top: 100,
        left: 0,
        width: 1000,
        height: 100,
        maxUpOffset: 20,
        maxDownOffset: 20,
        maxLeftOffset: 20,
        maxRightOffset: 20,
      },
      {
        selector: '#overflowing-div',
        maxUpOffset: 20,
        maxDownOffset: 20,
        maxLeftOffset: 20,
        maxRightOffset: 20,
      },
    ],
  })
  await eyes.close(true)
})
test('eyes.checkWindow layout', async t => {
  await t.navigateTo('https://applitools.github.io/demo/TestPages/FramesTestPage/')
  await eyes.open({t, appName: 'eyes-testcafe', testName: 'legacy api test: checkWindow layout'})
  await eyes.checkWindow({
    layout: [{top: 100, left: 0, width: 1000, height: 100}, {selector: '#overflowing-div'}],
  })
  await eyes.close(true)
})
test('eyes.checkWindow strict', async t => {
  await t.navigateTo('https://applitools.github.io/demo/TestPages/FramesTestPage/')
  await eyes.open({t, appName: 'eyes-testcafe', testName: 'legacy api test: checkWindow strict'})
  await eyes.checkWindow({
    strict: [{top: 100, left: 0, width: 1000, height: 100}, {selector: '#overflowing-div'}],
  })
  await eyes.close(true)
})
test('eyes.checkWindow content', async t => {
  await t.navigateTo('https://applitools.github.io/demo/TestPages/FramesTestPage/')
  await eyes.open({t, appName: 'eyes-testcafe', testName: 'legacy api test: checkWindow content'})
  await eyes.checkWindow({
    content: [{top: 100, left: 0, width: 1000, height: 100}, {selector: '#overflowing-div'}],
  })
  await eyes.close(true)
})
test('eyes.checkWindow accessibility', async t => {
  await t.navigateTo('https://applitools.github.io/demo/TestPages/FramesTestPage/')
  await eyes.open({
    t,
    appName: 'eyes-testcafe',
    testName: 'legacy api test: checkWindow accessibility',
  })
  await eyes.checkWindow({
    accessibility: [
      {accessibilityType: 'RegularText', selector: '#overflowing-div'},
      {accessibilityType: 'BoldText', top: 100, left: 0, width: 1000, height: 100},
    ],
  })
  await eyes.close(true)
})
test('eyes.checkWindow scriptHooks', async t => {
  await t.navigateTo('https://applitools.github.io/demo/TestPages/FramesTestPage/')
  await eyes.open({
    t,
    appName: 'eyes-testcafe',
    browser: [{width: 800, height: 600, name: 'chrome'}],
    testName: 'legacy api test: checkWindow scriptHooks',
  })
  await eyes.checkWindow({
    scriptHooks: {
      beforeCaptureScreenshot: "document.body.style.backgroundColor = 'gold'",
    },
  })
  await eyes.close(true)
})
// NOTE: sendDom is always true when running against VG... ¯\_(ツ)_/¯
test.skip('eyes.checkWindow sendDom', async t => {
  await t.navigateTo('https://applitools.github.io/demo/TestPages/FramesTestPage/')
  await eyes.open({t, appName: 'eyes-testcafe', testName: 'legacy api test: checkWindow sendDom'})
  await eyes.checkWindow({
    sendDom: false,
  })
  const result = await eyes.close(false)
  const info = await getTestInfo(result, process.env.APPLITOOLS_API_KEY)
  console.log(info['actualAppOutput']['0']['image'])
  assert.deepStrictEqual(info['actualAppOutput']['0']['image']['hasDom'], false)
})
test('eyes.waitForResults', async t => {
  const eyes = new Eyes()
  await t.navigateTo('https://applitools.github.io/demo/TestPages/FramesTestPage/')
  await eyes.open({
    t,
    appName: 'eyes-testcafe',
    testName: 'legacy api test: checkWindow waitForResults',
  })
  await eyes.checkWindow({})
  await eyes.close(false)
  const result = await eyes.waitForResults()
  assert.ok(result instanceof TestResultsSummary)
  assert.ok(result.getAllResults().length > 0)
  assert.deepStrictEqual(result._passed, 1)
})
test('eyes failTestcafeOnDiff false', async t => {
  const eyes = new Eyes()
  await t.navigateTo('https://applitools.github.io/demo/TestPages/FramesTestPage/')
  await eyes.open({
    t,
    appName: 'eyes-testcafe',
    testName: 'legacy api test: failTestcafeOnDiff',
    failTestcafeOnDiff: false,
    saveDiffs: false,
  })
  // force a diff
  await eyes.checkWindow({
    scriptHooks: {
      beforeCaptureScreenshot: "document.body.style.backgroundColor = 'pink'",
    },
  })
  // even when set to throw ex, the test should still pass
  await eyes.close(true)
  await eyes.waitForResults(true)
})
test('eyes failTestcafeOnDiff true', async t => {
  const eyes = new Eyes()
  await t.navigateTo('https://applitools.github.io/demo/TestPages/FramesTestPage/')
  await eyes.open({
    t,
    appName: 'eyes-testcafe',
    testName: 'legacy api test: failTestcafeOnDiff',
    failTestcafeOnDiff: true,
    saveDiffs: false,
  })
  // force a diff
  await eyes.checkWindow({
    scriptHooks: {
      beforeCaptureScreenshot: "document.body.style.backgroundColor = 'hotpink'",
    },
  })
  try {
    // when set to throw ex, the test fail
    await eyes.close(true)
    await eyes.waitForResults(true)
    assert(false) // we should not reach this
  } catch (error) {
    // we should not reach this
    console.log(error)
    if (error.message.includes('detected differences')) assert(true)
    else assert(false)
  }
})
test('eyes failTestcafeOnDiff default value is true', async t => {
  const eyes = new Eyes()
  await t.navigateTo('https://applitools.github.io/demo/TestPages/FramesTestPage/')
  await eyes.open({
    t,
    appName: 'eyes-testcafe',
    testName: 'legacy api test: failTestcafeOnDiff',
    saveDiffs: false,
  })
  // force a diff
  await eyes.checkWindow({
    scriptHooks: {
      beforeCaptureScreenshot: "document.body.style.backgroundColor = 'hotpink'",
    },
  })
  try {
    // when set to throw ex, the test fail
    await eyes.close(true)
    await eyes.waitForResults(true)
    assert(false) // we should not reach this
  } catch (error) {
    // we should not reach this
    if (error.message.includes('detected differences')) assert(true)
    else assert(false)
  }
})

test('should load applitools.config.js', async t => {
  const configPath = path.join(__dirname, 'applitools.config.js')
  const eyes = new Eyes({configPath})
  await t.resizeWindow(2000, 1000)
  await eyes.open({
    t,
    appName: 'eyes-testcafe',
    testName: 'legacy api test: applitools.config.js',
    failTestcafeOnDiff: false,
  })
  const config = eyes.getConfiguration()
  assert.deepStrictEqual(config.getBrowsersInfo(), require(configPath).browser)
})
test('should load applitools.config.js w/o args object', async t => {
  const configPath = path.join(__dirname, 'applitools.config.js')
  const eyes = new Eyes({configPath})
  await eyes.open(t, 'eyes-testcafe', 'legacy api test: applitools.config.js')
  const config = eyes.getConfiguration()
  assert.deepStrictEqual(config.getBrowsersInfo(), require(configPath).browser)
})
test('should output a tap file when tapDirPath is specified', async t => {
  const eyes = new Eyes()
  await t.navigateTo('https://applitools.github.io/demo/TestPages/FramesTestPage/')
  const pathToFile = path.resolve(__dirname, 'eyes.tap')
  try {
    await eyes.open({
      t,
      appName: 'eyes-testcafe',
      testName: 'legacy api test: tapDirPath',
      failTestcafeOnDiff: false,
      tapDirPath: __dirname,
    })
    await eyes.checkWindow()
    await eyes.close()
    await eyes.waitForResults()
    assert(fs.existsSync(pathToFile))
    assert(
      fs
        .readFileSync(pathToFile, {encoding: 'utf-8'})
        .includes(`ok 1 - [PASSED TEST] Test: 'legacy api test: tapDirPath', Application: 'eyes-testcafe'`),
    )
  } finally {
    pathToFile && fs.unlinkSync(pathToFile)
  }
})
test('should output a tap file when tapDirPath is specified and waitForResults throws an exception', async t => {
  const eyes = new Eyes()
  await t.navigateTo('https://applitools.github.io/demo/TestPages/FramesTestPage/')
  const pathToFile = path.resolve(__dirname, 'eyes.tap')
  try {
    await eyes.open({
      t,
      appName: 'eyes-testcafe',
      testName: 'legacy api test: tapDirPath w/ exception',
      failTestcafeOnDiff: true,
      tapDirPath: __dirname,
    })
    // force a diff
    await eyes.checkWindow({
      scriptHooks: {
        beforeCaptureScreenshot: "document.body.style.backgroundColor = 'blue'",
      },
    })
    await eyes.close(false)
    await eyes.waitForResults(true) // I'm not convinced this actually throws
    assert(fs.existsSync(pathToFile))
    assert(
      fs
        .readFileSync(pathToFile, {encoding: 'utf-8'})
        .includes(
          `ok 1 - [PASSED TEST] Test: 'legacy api test: tapDirPath w/ exception', Application: 'eyes-testcafe'`,
        ),
    )
  } finally {
    pathToFile && fs.unlinkSync(pathToFile)
  }
})
test('should set concurrency correctly', async () => {
  const eyes = new Eyes({configPath: path.join(__dirname, 'applitools.config.js')})
  const runner = eyes.getRunner()
  assert.deepStrictEqual(runner.testConcurrency, 10)
})
test('should support env vars for configuration', async () => {
  try {
    process.env.APPLITOOLS_NOTIFY_ON_COMPLETION = 'blah'
    const eyes = new Eyes()
    const config = eyes.getConfiguration()
    assert.ok(config.batch.notifyOnCompletion)
  } finally {
    process.env.APPLITOOLS_NOTIFY_ON_COMPLETION = false
  }
})
