const utils = require('@applitools/utils')

function transformConfig(config) {
  return {
    open: dropUndefinedProperties({
      serverUrl: config.serverUrl,
      apiKey: config.apiKey,
      agentId: config.agentId,
      proxy: config.proxy,
      connectionTimeout: config.connectionTimeout,
      removeSession: config.removeSession,
      appName: config.appName,
      testName: config.testName,
      displayName: config.displayName,
      sessionType: config.sessionType,
      properties: config.properties,
      batch: config.batch,
      baselineEnvName: config.baselineEnvName,
      environmentName: config.environmentName,
      environment: dropUndefinedProperties({
        hostingApp: config.hostApp,
        hostingAppInfo: config.hostAppInfo,
        os: config.hostOS,
        osInfo: config.hostOSInfo,
        deviceName: config.deviceInfo,
        viewportSize: config.viewportSize,
      }),
      branchName: config.branchName,
      parentBranchName: config.parentBranchName,
      baselineBranchName: config.baselineBranchName,
      compareWithParentBranch: config.compareWithParentBranch,
      ignoreBaseline: config.ignoreBaseline,
      ignoreGitBranching: config.ignoreGitMergeBase,
      saveDiffs: config.saveDiffs,
      keepBatchOpen: config.dontCloseBatches,
      useCeilForViewportSize: config.useCeilForViewportSize,
      userTestId: config.userTestId,
    }),
    screenshot: dropUndefinedProperties({
      fully: config.forceFullPageScreenshot,
      scrollRootElement: config.scrollRootElement,
      stitchMode: config.stitchMode,
      hideScrollbars: config.hideScrollbars,
      hideCaret: config.hideCaret,
      overlap: !utils.types.isNull(config.stitchOverlap) ? {bottom: config.stitchOverlap} : undefined,
      waitBetweenStitches: config.waitBeforeScreenshots,
      waitBeforeCapture: config.waitBeforeCapture,
      normalization: dropUndefinedProperties({
        cut: config.cut,
        rotation: config.rotation,
        scaleRatio: config.scaleRatio,
      }),
      debugImages:
        config.debugScreenshots && config.debugScreenshots.save && utils.types.has(config.debugScreenshots, 'path')
          ? config.debugScreenshots
          : undefined,
    }),
    check: dropUndefinedProperties({
      renderers:
        config.browsersInfo &&
        config.browsersInfo.map(browserInfo => {
          if (utils.types.has(browserInfo, 'iosDeviceInfo')) {
            const {iosVersion, ...iosDeviceInfo} = browserInfo.iosDeviceInfo
            return {iosDeviceInfo: {...iosDeviceInfo, version: iosVersion}}
          }
          return browserInfo
        }),
      ufgOptions: config.visualGridOptions,
      layoutBreakpoints: config.layoutBreakpoints,
      disableBrowserFetching: config.disableBrowserFetching,
      autProxy: config.autProxy,
      sendDom: config.sendDom,
      retryTimeout: config.matchTimeout,
      matchLevel: config.defaultMatchSettings && config.defaultMatchSettings.matchLevel,
      ignoreCaret: config.defaultMatchSettings && config.defaultMatchSettings.ignoreCaret,
      ignoreDisplacements: config.defaultMatchSettings && config.defaultMatchSettings.ignoreDisplacements,
      enablePatterns: config.defaultMatchSettings && config.defaultMatchSettings.enablePatterns,
      accessibilitySettings: config.defaultMatchSettings &&
        config.defaultMatchSettings.accessibilitySettings && {
          level: config.defaultMatchSettings.accessibilitySettings.level,
          version: config.defaultMatchSettings.accessibilitySettings.guidelinesVersion,
        },
      useDom: config.defaultMatchSettings && config.defaultMatchSettings.useDom,
      ignoreRegions: config.defaultMatchSettings && config.defaultMatchSettings.ignoreRegions,
      contentRegions: config.defaultMatchSettings && config.defaultMatchSettings.contentRegions,
      layoutRegions: config.defaultMatchSettings && config.defaultMatchSettings.layoutRegions,
      strictRegions: config.defaultMatchSettings && config.defaultMatchSettings.strictRegions,
      floatingRegions: config.defaultMatchSettings && config.defaultMatchSettings.floatingRegions,
      accessibilityRegions: config.defaultMatchSettings && config.defaultMatchSettings.accessibilityRegions,
    }),
    close: dropUndefinedProperties({
      updateBaselineIfDifferent: config.saveFailedTests,
      updateBaselineIfNew: config.saveNewTests,
    }),
  }
}

function dropUndefinedProperties(object) {
  return Object.entries(object).reduce(
    (object, [key, value]) => (value !== undefined ? Object.assign(object, {[key]: value}) : object),
    {},
  )
}

module.exports = transformConfig
