const utils = require('@applitools/utils')

function transformConfig(config) {
  const transformedConfig = {
    open: {},
    screenshot: {},
    check: {},
    close: {},
  }

  if (config.serverUrl) transformedConfig.open.serverUrl = config.serverUrl
  if (config.apiKey) transformedConfig.open.apiKey = config.apiKey
  if (config.agentId) transformedConfig.open.agentId = config.agentId
  if (config.proxy) transformedConfig.open.proxy = config.proxy
  if (config.connectionTimeout) transformedConfig.open.connectionTimeout = config.connectionTimeout
  if (config.removeSession) transformedConfig.open.removeSession = config.removeSession
  if (config.appName) transformedConfig.open.appName = config.appName
  if (config.testName) transformedConfig.open.testName = config.testName
  if (config.displayName) transformedConfig.open.displayName = config.displayName
  if (config.sessionType) transformedConfig.open.sessionType = config.sessionType
  if (config.properties) transformedConfig.open.properties = config.properties
  if (config.batch) transformedConfig.open.batch = config.batch
  if (config.baselineEnvName) transformedConfig.open.baselineEnvName = config.baselineEnvName
  if (config.environmentName) transformedConfig.open.environmentName = config.environmentName
  if (config.branchName) transformedConfig.open.branchName = config.branchName
  if (config.parentBranchName) transformedConfig.open.parentBranchName = config.parentBranchName
  if (config.baselineBranchName) transformedConfig.open.baselineBranchName = config.baselineBranchName
  if (config.compareWithParentBranch) transformedConfig.open.compareWithParentBranch = config.compareWithParentBranch
  if (config.ignoreBaseline) transformedConfig.open.ignoreBaseline = config.ignoreBaseline
  if (config.ignoreGitMergeBase) transformedConfig.open.ignoreGitBranching = config.ignoreGitMergeBase
  if (config.saveDiffs) transformedConfig.open.saveDiffs = config.saveDiffs
  if (config.dontCloseBatches) transformedConfig.open.keepBatchOpen = config.dontCloseBatches
  transformedConfig.open.environment = {}
  if (config.hostApp) transformedConfig.open.environment.hostingApp = config.hostApp
  if (config.hostAppInfo) transformedConfig.open.environment.hostingAppInfo = config.hostAppInfo
  if (config.hostOS) transformedConfig.open.environment.os = config.hostOS
  if (config.hostOSInfo) transformedConfig.open.environment.osInfo = config.hostOSInfo
  if (config.deviceInfo) transformedConfig.open.environment.deviceName = config.deviceInfo
  if (config.viewportSize) transformedConfig.open.environment.viewportSize = config.viewportSize

  if (config.forceFullPageScreenshot) transformedConfig.screenshot.fully = config.forceFullPageScreenshot
  if (config.scrollRootElement) transformedConfig.screenshot.scrollRootElement = config.scrollRootElement
  if (config.stitchMode) transformedConfig.screenshot.stitchMode = config.stitchMode
  if (config.hideScrollbars) transformedConfig.screenshot.hideScrollbars = config.hideScrollbars
  if (config.hideCaret) transformedConfig.screenshot.hideCaret = config.hideCaret
  if (!utils.types.isNull(config.stitchOverlap)) transformedConfig.screenshot.overlap = {bottom: config.stitchOverlap}
  if (!utils.types.isNull(config.waitBeforeScreenshots))
    transformedConfig.screenshot.waitBetweenStitches = config.waitBeforeScreenshots
  if (!utils.types.isNull(config.waitBeforeCapture))
    transformedConfig.screenshot.waitBeforeCapture = config.waitBeforeCapture
  if (config.debugScreenshots && config.debugScreenshots.save && utils.types.has(config.debugScreenshots, 'path'))
    transformedConfig.screenshot.debugImages = config.debugScreenshots
  transformedConfig.screenshot.normalization = {}
  if (config.cut) transformedConfig.screenshot.cut = config.cut
  if (config.rotation) transformedConfig.screenshot.rotation = config.rotation
  if (config.scaleRatio) transformedConfig.screenshot.scaleRatio = config.scaleRatio

  if (config.browsersInfo) {
    transformedConfig.check.renderers = config.browsersInfo.map(browserInfo => {
      if (utils.types.has(browserInfo, 'iosDeviceInfo')) {
        const {iosVersion, ...iosDeviceInfo} = browserInfo.iosDeviceInfo
        return {iosDeviceInfo: {...iosDeviceInfo, version: iosVersion}}
      }
      return browserInfo
    })
  }
  if (config.visualGridOptions) transformedConfig.check.ufgOptions = config.visualGridOptions
  if (config.layoutBreakpoints) transformedConfig.check.layoutBreakpoints = config.layoutBreakpoints
  if (config.disableBrowserFetching) transformedConfig.check.disableBrowserFetching = config.disableBrowserFetching
  if (config.autProxy) transformedConfig.check.autProxy = config.autProxy
  if (config.sendDom) transformedConfig.check.sendDom = config.sendDom
  if (config.matchTimeout) transformedConfig.check.retryTimeout = config.matchTimeout
  if (config.defaultMatchSettings && config.defaultMatchSettings.matchLevel)
    transformedConfig.check.matchLevel = config.defaultMatchSettings.matchLevel
  if (config.defaultMatchSettings && config.defaultMatchSettings.ignoreCaret)
    transformedConfig.check.ignoreCaret = config.defaultMatchSettings.ignoreCaret
  if (config.defaultMatchSettings && config.defaultMatchSettings.ignoreDisplacements)
    transformedConfig.check.ignoreDisplacements = config.defaultMatchSettings.ignoreDisplacements
  if (config.defaultMatchSettings && config.defaultMatchSettings.enablePatterns)
    transformedConfig.check.enablePatterns = config.defaultMatchSettings.enablePatterns
  if (config.defaultMatchSettings && config.defaultMatchSettings.useDom)
    transformedConfig.check.useDom = config.defaultMatchSettings.useDom
  if (config.defaultMatchSettings && config.defaultMatchSettings.ignoreRegions)
    transformedConfig.check.ignoreRegions = config.defaultMatchSettings.ignoreRegions
  if (config.defaultMatchSettings && config.defaultMatchSettings.contentRegions)
    transformedConfig.check.contentRegions = config.defaultMatchSettings.contentRegions
  if (config.defaultMatchSettings && config.defaultMatchSettings.layoutRegions)
    transformedConfig.check.layoutRegions = config.defaultMatchSettings.layoutRegions
  if (config.defaultMatchSettings && config.defaultMatchSettings.strictRegions)
    transformedConfig.check.strictRegions = config.defaultMatchSettings.strictRegions
  if (config.defaultMatchSettings && config.defaultMatchSettings.floatingRegions)
    transformedConfig.check.floatingRegions = config.defaultMatchSettings.floatingRegions
  if (config.defaultMatchSettings && config.defaultMatchSettings.accessibilityRegions)
    transformedConfig.check.accessibilityRegions = config.defaultMatchSettings.accessibilityRegions
  if (config.defaultMatchSettings && config.defaultMatchSettings.accessibilitySettings) {
    transformedConfig.check.accessibilitySettings = {
      level: config.defaultMatchSettings.accessibilitySettings.level,
      version: config.defaultMatchSettings.accessibilitySettings.guidelinesVersion,
    }
  }

  if (!utils.types.isNull(config.saveFailedTests))
    transformedConfig.close.updateBaselineIfDifferent = config.saveFailedTests
  if (!utils.types.isNull(config.saveNewTests)) transformedConfig.close.updateBaselineIfNew = config.saveNewTests

  return transformedConfig
}

module.exports = transformConfig
