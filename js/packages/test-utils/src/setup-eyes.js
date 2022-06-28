const fs = require('fs')
const path = require('path')
const cwd = process.cwd()

const batch = {
  name: process.env.APPLITOOLS_BATCH_NAME || 'JS Coverage Tests',
}

function setupEyes({runner, vg, showLogs, saveLogs, saveDebugScreenshots, sdk = cwd, ...config} = {}) {
  const {Eyes, VisualGridRunner} = require(require.resolve(path.join(sdk, './dist'), {paths: [cwd]}))
  runner = runner || (vg ? new VisualGridRunner({testConcurrency: 500}) : undefined)
  const configuration = {
    apiKey: process.env.APPLITOOLS_API_KEY_SDK,
    batch,
    parentBranchName: 'master',
    branchName: 'master',
    dontCloseBatches: true,
    matchTimeout: 0,
    saveNewTests: false,
    ...config,
  }

  if (process.env.APPLITOOLS_SHOW_LOGS || showLogs) {
    configuration.logs = {type: 'console'}
  } else if (process.env.APPLITOOLS_SAVE_LOGS || saveLogs) {
    const logsPath = path.resolve(
      cwd,
      typeof saveLogs === 'string' ? saveLogs : `./logs/${new Date().toISOString()}.log`,
    )
    configuration.logs = {type: 'file', filename: logsPath}
  }

  if (process.env.APPLITOOLS_SAVE_DEBUG_SCREENSHOTS || saveDebugScreenshots) {
    const debugScreenshotsPath = path.resolve(
      cwd,
      typeof saveDebugScreenshots === 'string' ? saveDebugScreenshots : `./logs/${new Date().toISOString()}`,
    )
    fs.mkdirSync(debugScreenshotsPath, {recursive: true})
    configuration.debugScreenshots = {
      save: true,
      path: debugScreenshotsPath,
    }
  }

  const eyes = new Eyes(runner)
  eyes.setConfiguration(configuration)
  return eyes
}

module.exports = setupEyes
