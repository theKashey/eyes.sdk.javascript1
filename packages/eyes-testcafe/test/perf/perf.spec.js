const path = require('path')
const fs = require('fs')
const {Eyes, Logger, FileLogHandler, VisualGridRunner} = require('../../index')
const {testServer} = require('@applitools/test-server')
const logDir = path.join(__dirname, 'out', Date.now().toString())
const NUMBER_OF_TESTS = 5
const NUMBER_OF_APP_RESOURCES = 10
const BYTE_SIZE_OF_APP_RESOURCES = 1024 * 1024 * 10

function generateTestAppFiles() {
  const outputDir = path.join(__dirname, 'fixtures')
  fs.rmdirSync(outputDir, {recursive: true})
  fs.mkdirSync(outputDir)
  let markup = 'hello world\n'
  Array.from({length: NUMBER_OF_APP_RESOURCES}).forEach((_entry, index) => {
    fs.writeFileSync(path.join(outputDir, `${index}.txt`), new Array(BYTE_SIZE_OF_APP_RESOURCES).join('a'))
    markup += `<object style="display: none;" width="300" height="300" type="text/plain" data="${index}.txt"></object>\n`
  })
  fs.writeFileSync(path.join(outputDir, `index.html`), markup)
}

function doLog(name, msg) {
  console.log(`[test ${name} says] ${msg}`)
}

function formatNumber(n) {
  return (n / 1000).toFixed(2)
}

async function doTest({t, name}) {
  const testStart = Date.now()
  const log = doLog.bind(undefined, name)
  // eyes setup
  process.env.APPLITOOLS_USE_PRELOADED_CONFIG = true
  const eyes = new Eyes(new VisualGridRunner({testConcurrency: NUMBER_OF_TESTS}))
  const logger = new Logger()
  const logHandler = new FileLogHandler(true, path.join(logDir, `${name}.log`))
  logHandler.open()
  logger.setLogHandler(logHandler)
  logger.prefix = name
  eyes.logger = logger
  const config = eyes.getConfiguration()
  config.setDisableBrowserFetching(true)
  config.setShowLogs(true)
  eyes.setConfiguration(config)
  // eyes setup end
  await t.setPageLoadTimeout(0)
  log('ohai')
  log('navigating to page')
  await t.navigateTo('http://localhost:7771/index.html')
  log('navigation complete')
  log('opening eyes')
  await eyes.open({
    t,
    appName: 'eyes-testcafe',
    testName: 'performance benchmarks',
  })
  log('eyes open')
  log('check start')
  const checkStart = Date.now()
  await eyes.checkWindow()
  const checkTotal = formatNumber(Date.now() - checkStart)
  t.fixtureCtx.stats.checkTimes.push(checkTotal)
  log(`check end, total time: ${checkTotal}s`)
  log('calling close')
  const closeStart = Date.now()
  await eyes.close(false)
  const closeTotal = formatNumber(Date.now() - closeStart)
  t.fixtureCtx.stats.closeTimes.push(closeTotal)
  log(`close end, total time: ${closeTotal}s`)
  log('buh-bye')
  logHandler.close()
  t.fixtureCtx.stats.testTimes.push(formatNumber(Date.now() - testStart))
  // retrieve DS logs
  const browserConsoleLogs = await t.getBrowserConsoleMessages()
  fs.writeFileSync(path.join(logDir, `${name}-dom-snapshot.log`), browserConsoleLogs.log.join('\n'))
}

fixture`perf benchmarks`
  .before(async ctx => {
    fs.mkdirSync(logDir)
    console.log('\n')
    console.log('========= init =========')
    console.log(`number of tests: ${NUMBER_OF_TESTS}`)
    console.log(`number of app resources: ${NUMBER_OF_APP_RESOURCES}`)
    console.log(
      `byte size of app resources: ${BYTE_SIZE_OF_APP_RESOURCES} (~${Math.round(
        BYTE_SIZE_OF_APP_RESOURCES / 1000000,
      )}mb)`,
    )
    console.log('========================')
    console.log('\n')
    generateTestAppFiles()
    const staticPath = path.join(__dirname, 'fixtures')
    ctx.server = await testServer({port: 7771, staticPath})
    ctx.stats = {
      checkTimes: [],
      closeTimes: [],
      testTimes: [],
      suiteStart: Date.now(),
    }
  })
  .after(async ctx => {
    await ctx.server.close()
    console.log('\n')
    console.log('========= stats =========')
    console.log(`suite total: ${formatNumber(Date.now() - ctx.stats.suiteStart)}s`)
    ctx.stats.testTimes.forEach(time => console.log(`test time: ${time}s`))
    ctx.stats.checkTimes.forEach(time => console.log(`check time: ${time}s`))
    ctx.stats.closeTimes.forEach(time => console.log(`close time: ${time}s`))
    console.log('========================')
    console.log('\n')
    console.log(`log files available in ${path.join(process.cwd(), 'test', 'perf', 'out')}`)
  })
for (let name in Array.from({length: NUMBER_OF_TESTS})) {
  test(name, async t => {
    await doTest({t, name})
  })
}
