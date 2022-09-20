function transformCheckSettings(settings) {
  const transformedSettings = {}
  if (settings.name) transformedSettings.name = settings.name
  if (settings.region) transformedSettings.region = settings.region
  if (settings.frames) transformedSettings.frames = settings.frames
  if (settings.scrollRootElement) transformedSettings.scrollRootElement = settings.scrollRootElement
  if (settings.fully) transformedSettings.fully = settings.fully
  if (settings.matchLevel) transformedSettings.matchLevel = settings.matchLevel
  if (settings.useDom) transformedSettings.useDom = settings.useDom
  if (settings.sendDom) transformedSettings.sendDom = settings.sendDom
  if (settings.enablePatterns) transformedSettings.enablePatterns = settings.enablePatterns
  if (settings.ignoreDisplacements) transformedSettings.ignoreDisplacements = settings.ignoreDisplacements
  if (settings.ignoreCaret) transformedSettings.ignoreCaret = settings.ignoreCaret
  if (settings.ignoreRegions) transformedSettings.ignoreRegions = settings.ignoreRegions
  if (settings.layoutRegions) transformedSettings.layoutRegions = settings.layoutRegions
  if (settings.strictRegions) transformedSettings.strictRegions = settings.strictRegions
  if (settings.contentRegions) transformedSettings.contentRegions = settings.contentRegions
  if (settings.floatingRegions) transformedSettings.floatingRegions = settings.floatingRegions
  if (settings.accessibilityRegions) transformedSettings.accessibilityRegions = settings.accessibilityRegions
  if (settings.disableBrowserFetching) transformedSettings.disableBrowserFetching = settings.disableBrowserFetching
  if (settings.layoutBreakpoints) transformedSettings.layoutBreakpoints = settings.layoutBreakpoints
  if (settings.visualGridOptions) transformedSettings.ufgOptions = settings.visualGridOptions
  if (settings.hooks) transformedSettings.hooks = settings.hooks
  if (settings.pageId) transformedSettings.pageId = settings.pageId
  if (settings.lazyLoad) transformedSettings.lazyLoad = settings.lazyLoad
  if (settings.waitBeforeCapture) transformedSettings.waitBeforeCapture = settings.waitBeforeCapture
  if (settings.timeout) transformedSettings.retryTimeout = settings.timeout
  if (settings.variationGroupId) transformedSettings.userCommandId = settings.variationGroupId

  return transformedSettings
}

module.exports = transformCheckSettings
