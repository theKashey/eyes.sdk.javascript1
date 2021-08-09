#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const util = require('util')
const yargs = require('yargs')
const {setupEyes} = require('@applitools/test-utils')
const utils = require('../src/cli-utils')
const cwd = process.cwd()
const delay = util.promisify(setTimeout)
const table = require('cli-table3')

const checkConfig = {
  name: {
    describe: 'tag for checkpoint',
    type: 'string',
    alias: 'n',
    default: 'render script',
  },
  region: {
    describe: 'region to check',
    alias: 'r',
    type: 'string',
    coerce(str) {
      const region = utils.parseRegion(str)
      if (region) return region
      return utils.parseSelector(str)
    },
  },
  frames: {
    describe: 'comma-separated list of frame references',
    type: 'string',
    coerce(str) {
      return utils.parseList(str).map(frame => {
        const map = utils.parseMap(frame)
        if (map) return map
        return utils.parseSelector(frame)
      })
    },
  },
  scrollRootElement: {
    describe: 'selector to scroll root element',
    type: 'string',
    coerce: utils.parseScript,
  },
  ignoreRegions: {
    describe: 'comma-separated list of selectors to ignore',
    type: 'string',
    coerce: parseRegionReferences,
  },
  layoutRegions: {
    describe: 'comma-separated list of selectors for layout regions',
    type: 'string',
    coerce: parseRegionReferences,
  },
  ignoreDisplacements: {
    describe: 'when specified, ignore displaced content',
    type: 'boolean',
    default: false,
  },
  layoutBreakpoints: {
    describe: 'comma-separated list of breakpoints (widths) for js layouts',
    type: 'string',
    coerce(str) {
      if (['', 'true'].includes(str)) return true
      else return utils.parseList(str).map(width => Number.parseInt(width.trim()))
    },
  },
  matchTimeout: {
    describe: 'match timeout',
    type: 'number',
    default: 0,
  },
  matchLevel: {
    describe: 'match level',
    type: 'string',
    // choices: Object.values(MatchLevel),
  },
  fully: {
    type: 'boolean',
    describe: 'whether to check target fully',
    default: false,
  },
  bcsHook: {
    type: 'string',
    describe: 'before capture screenshot hook',
  },
}

const buildConfig = {
  browser: {
    describe: 'preset name of browser. (e.g. "edge-18", "ie-11", "safari-11", "firefox")',
    alias: 'b',
    type: 'string',
    default: 'chrome',
  },
  device: {
    describe: 'preset name of browser (e.g. "iPhone X", "Pixel 4")',
    type: 'string',
  },
  deviceOrientation: {
    describe: 'device orientation',
    type: 'string',
  },
  capabilities: {
    describe:
      'capabilities for driver "deviceName=>iPhone 8 Simulator; platformName=>iOS; platformVersion=>13.2; appiumVersion=>1.16.0; browserName=>Safari"',
    type: 'string',
    coerce: utils.parseMap,
  },
  attach: {
    describe: 'attach to existing chrome via remote debugging port',
    type: 'boolean',
    alias: 'a',
  },
  driverUrl: {
    describe: 'url to the driver server',
    type: 'string',
  },
  headless: {
    describe: 'open browser in headless mode',
    type: 'boolean',
    default: true,
  },
  // browserProxy: {
  //   describe:
  //     'whether to use charles as a proxy to webdriver calls (works on port 8888, need to start Charles manually prior to running this script',
  //   type: 'boolean',
  // },
}

const eyesConfig = {
  sdk: {
    type: 'string',
    describe: 'path to sdk',
    default: process.cwd(),
    alias: 's',
  },
  compare: {
    type: 'boolean',
    describe: 'compare classic with visual-grid',
    default: false,
    alias: 'c',
  },
  vg: {
    type: 'boolean',
    describe: 'when specified, use visual grid instead of classic runner',
    alias: 'v',
  },
  css: {
    type: 'boolean',
    describe: 'when specified, use CSS stitch mode',
  },
  viewportSize: {
    describe: 'viewport size to open the browser (widthxheight)',
    type: 'string',
    coerce: utils.parseSize,
    conflicts: ['device'],
  },
  apiKey: {
    describe: 'Applitools API key',
    type: 'string',
    default: process.env.APPLITOOLS_API_KEY,
  },
  serverUrl: {
    describe: 'server url',
    type: 'string',
  },
  proxy: {
    describe: 'proxy string, e.g. http://localhost:8888',
    type: 'string',
  },
  stitchOverlap: {
    describe: 'stitch overlap',
    type: 'number',
  },
  saveDebugScreenshots: {
    describe: 'save debug screenshots',
    type: 'boolean',
  },
  envName: {
    describe: 'baseline env name',
    type: 'string',
  },
  appName: {
    describe: 'app name for baseline',
    type: 'string',
    default: 'selenium render',
  },
  displayName: {
    describe:
      "display name for test. This is what shows up in the dashboard as the test name, but doesn't affect the baseline.",
    type: 'string',
  },
  batchId: {
    describe: 'batch id',
    type: 'string',
  },
  batchName: {
    describe: 'batch name',
    type: 'string',
  },
  notifyOnCompletion: {
    describe: 'batch notifications',
    type: 'boolean',
  },
  accessibilityValidation: {
    describe: 'accessibility validation (comma-separated, e.g. AA,WCAG_2_0)',
    type: 'string',
    coerce: utils.parseSequence(['level', 'version'], ','),
  },
  renderBrowsers: {
    describe: 'comma-separated list of browser to render in vg mode (e.g. chrome(800x600))',
    type: 'string',
    coerce(str) {
      const regexp = /^(chrome|chrome-1|chrome-2|chrome-canary|firefox|firefox-1|firefox-2|ie11|ie10|edge|safari|safari-1|safari-2|ie-vmware|edge-chromium|edge-chromium-1|edge-chromium-2)(\( *(\d+) *(x|,) *(\d+) *\))?$/
      return utils.parseList(str).map(browser => {
        const match = browser.match(regexp)
        if (!match) {
          throw new Error(
            'invalid syntax. Supports only chrome[-one-version-back/-two-versions-back], firefox[-one-version-back/-two-versions-back], ie11, ie10, edge, safari[-one-version-back/-two-versions-back] as browsers, and the syntax is browser(widthxheight)',
          )
        }
        return {
          name: match[1],
          width: Number.parseInt(match[3], 10) || 700,
          height: Number.parseInt(match[5], 10) || 460,
        }
      })
    },
  },
  renderEmulations: {
    describe:
      'comma-separated list of chrome-emulation devices to render in vg mode (e.g. "Pixel 4:portrait", "Nexus 7")',
    type: 'string',
    coerce(str) {
      // const {DeviceName, ScreenOrientation, MatchLevel} = require(cwd)
      // const deviceNames = Object.values(DeviceName)
      // const orientations = Object.values(ScreenOrientation)
      return utils.parseList(str).map(deviceStr => {
        const deviceInfo = utils.parseSequence(['deviceName', 'screenOrientation'], ':')(deviceStr)
        // if (!deviceNames.includes(deviceInfo.deviceName)) {
        //   throw new Error(`invalid device name. Supports only ${deviceNames.join(', ')}`)
        // }
        // if (deviceInfo.screenOrientation && !orientations.includes(deviceInfo.screenOrientation)) {
        //   throw new Error(`invalid screen orientation. Supports only ${orientations.join(', ')}`)
        // }
        return {chromeEmulationInfo: deviceInfo}
      })
    },
  },
}

const testConfig = {
  url: {
    description: 'url to check',
    type: 'string',
  },
  delay: {
    describe: 'delay in seconds before capturing page',
    type: 'number',
    default: 0,
    alias: 'd',
  },
  runBefore: {
    describe:
      'path to JavaScript file which exports an async function which should be run before the visual check. The function receives the driver as a parameter so is can perform page interactions.',
    type: 'string',
    coerce(str) {
      if (str.charAt(0) !== '/') str = `./${str}`
      return path.resolve(cwd, str)
    },
  },
}

const saveConfig = {
  save: {
    description: 'save test to file instead of running it',
    type: 'string',
    coerce(str) {
      return ['', 'true'].includes(str) || str
    },
  },
}

yargs
  .usage('yarn render [url] [options]')
  .example(
    'yarn render http://example.org --viewport-size 800x600 --css',
    'classic viewport screenshot, browser width 800 pixels, browser height 600 pixels, css stitching',
  )
  .example(
    'yarn render http://example.org --vg --browser firefox(1200x900)',
    'visual grid render, default viewport size of 1024x768, vg browser is firefox at 1200x900',
  )
  .example(
    'yarn render http://example.org --ignore-regions "#ignore-this,.dynamic-element" --fully',
    'classic full page screenshot, 2 ignore regions',
  )
  .command({
    command: '* [url]',
    builder: yargs =>
      yargs.options({...buildConfig, ...eyesConfig, ...checkConfig, ...testConfig, ...saveConfig}),
    handler: async args => {
      console.log(`render options\n${formatArgs(args)}`)
      try {
        let testResults
        if (args.compare) {
          args.testName = `eyes-compare ${Date.now()}`
          for (const {vg} of [{vg: false}, {vg: true}]) {
            testResults = await runner({...args, vg})
          }
        } else {
          testResults = await runner(args)
        }
        printTestResults(testResults)
      } catch (err) {
        console.log(err)
        process.exit(1)
      }
    },
  })
  .wrap(yargs.terminalWidth())
  .help().argv

function printTestResults(testResults) {
  const resultsStr = testResults
    .getAllResults()
    .map(testResultContainer => {
      const testResults = testResultContainer.getTestResults()
      return testResults ? formatResults(testResults) : testResultContainer.getException()
    })
    .join('\n')

  console.log(`render results\n${resultsStr}`)
}

async function runner(args) {
  const spec = require(require.resolve(path.join(args.sdk, 'dist/spec-driver'), {paths: [cwd]}))

  let runBeforeFunc
  if (args.runBefore !== undefined) {
    if (!fs.existsSync(args.runBefore)) {
      throw new Error('file specified in --run-before does not exist:', args.runBefore)
    }
    runBeforeFunc = require(args.runBefore)
    if (typeof runBeforeFunc !== 'function') {
      throw new Error(`exported value from --run-before file is not a function: ${args.runBefore}`)
    }
  }

  const [driver, destroyDriver] = await spec.build(argsToBuildConfig(args))

  try {
    args.url = args.attach ? await spec.getUrl(driver) : args.url
    if (!args.attach) await spec.visit(driver, args.url)
    console.log(
      `running ${args.vg ? 'ultrafast mode' : 'classic mode'} render ${
        args.compare ? 'compare ' : ''
      }script for`,
      args.url,
    )

    args.saveLogs = path.resolve(cwd, `./logs/${formatUrl(args.url)}-${formatDate(new Date())}.log`)
    args.saveDebugScreenshots = args.saveDebugScreenshots && args.saveLogs.replace('.log', '')
    console.log('log file at:', args.saveLogs, '\n')
    if (args.saveDebugScreenshots) console.log('debug screenshots at:', args.saveDebugScreenshots)

    const eyes = setupEyes(argsToEyesConfig(args))
    const logger = eyes.getLogger()
    const runner = eyes.getRunner()

    logger.log('[render script] Running render script for', args.url)
    logger.log(`[render script] process versions: ${JSON.stringify(process.versions)}`)

    if (runBeforeFunc) await runBeforeFunc(driver)

    await eyes.open(driver, args.appName, args.testName || args.url)

    logger.log(`[render script] awaiting delay... ${args.delay}s`)
    await delay(args.delay * 1000)
    logger.log('[render script] awaiting delay... DONE')

    await eyes.check(argsToCheckConfig(args))

    await eyes.close(false)

    logger.getLogHandler().open()
    const results = await runner.getAllTestResults(false)
    logger.getLogHandler().close()
    return results
  } finally {
    await destroyDriver()
  }
}

function parseRegionReferences(str) {
  return utils.parseList(str).map(frame => {
    const region = utils.parseRegion(frame)
    if (region) return region
    return utils.parseSelector(frame)
  })
}

function argsToBuildConfig(args) {
  return {
    browser: args.browser,
    device: args.device,
    orientation: args.deviceOrientation,
    capabilities: args.capabilities,
    url: args.driverUrl,
    attach: args.attach,
    headless: args.headless,
  }
}

function argsToEyesConfig(args) {
  return {
    sdk: args.sdk,
    vg: args.vg,
    apiKey: args.apiKey,
    serverUrl: args.serverUrl,
    viewportSize: args.viewportSize || (!args.device ? {width: 1024, height: 768} : undefined),
    browsersInfo: [...(args.renderBrowsers || []), ...(args.renderEmulations || [])],
    proxy: args.proxy,
    accessibilityValidation: args.accessibilityValidation,
    matchLevel: args.matchLevel,
    stitchMode: args.css ? 'CSS' : 'Scroll',
    stitchOverlap: args.stitchOverlap,
    parentBranchName: 'default',
    branchName: 'default',
    displayName: args.displayName,
    baselineEnvName: args.envName, // determines the baseline
    environmentName: args.envName, // shows up in the Environment column in the dashboard
    batch:
      args.batchId || args.batchName || args.notifyOnCompletion
        ? {id: args.batchId, name: args.batchName, notifyOnCompletion: args.notifyOnCompletion}
        : undefined,
    dontCloseBatches: false,
    saveNewTests: true,
    saveLogs: args.saveLogs,
    saveDebugScreenshots: args.saveDebugScreenshots,
  }
}

function argsToCheckConfig(args) {
  return {
    name: args.name,
    region: args.region,
    frames: args.frames,
    scrollRootElement: args.scrollRootElement,
    ignoreRegions: args.ignoreRegions,
    layoutRegions: args.layoutRegions,
    layoutBreakpoints: args.layoutBreakpoints,
    ignoreDisplacements: args.ignoreDisplacements,
    timeout: args.matchTimeout,
    fully: args.fully,
    hooks: args.bcsHook ? {beforeCaptureScreenshot: args.bcsHook} : undefined,
  }
}

function formatDate(d) {
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const date = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  return `${d.getFullYear()}-${month}-${date}-${hours}-${minutes}-${seconds}`
}

function formatUrl(url) {
  return new URL(url).hostname.replace(/\./g, '-')
}

function formatArgs(args) {
  const outputTable = new table({
    style: {head: [], border: []},
    chars: {mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': ''},
  })
  Object.entries(args).reduce((lines, [key, value]) => {
    // don't show the entire cli, and show only the camelCase version of each arg
    if (!['_', '$0'].includes(key) && !key.includes('-') && key.length > 1) {
      lines.push([key, JSON.stringify(value)])
    }
    return lines
  }, outputTable)
  return outputTable.toString()
}

function formatResults(testResults) {
  const outputTable = new table({
    style: {head: [], border: []},
    chars: {mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': ''},
  })
  outputTable.push(['name', testResults.getName()])
  outputTable.push(['status', testResults.getStatus()])
  outputTable.push(['url', testResults.getUrl()])
  outputTable.push(['total steps', testResults.getSteps()])
  outputTable.push(['matches', testResults.getMatches()])
  outputTable.push(['diffs', testResults.getMismatches()])
  outputTable.push(['missing', testResults.getMissing()])
  outputTable.push(['viewport', testResults.getHostDisplaySize().toString()])
  outputTable.push([
    'steps',
    `${testResults
      .getStepsInfo()
      .map(step => {
        return `${step.getName()} - ${getStepStatus(step)}`
      })
      .join('\n')}`,
  ])
  return outputTable.toString()

  function getStepStatus(step) {
    if (step.getIsDifferent()) {
      return 'Diff'
    } else if (!step.getHasBaselineImage()) {
      return 'New'
    } else if (!step.getHasCurrentImage()) {
      return 'Missing'
    } else {
      return 'Passed'
    }
  }
}
