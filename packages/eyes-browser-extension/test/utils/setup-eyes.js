function setupEyes({driver, vg, ...config} = {}) {
  return {
    constructor: {
      async setViewportSize(_driver, size) {
        return driver.evaluate(size => window.__applitools.setViewportSize({size}), size)
      },
    },
    runner: {
      getAllTestResults(_throwErr) {},
    },
    async getViewportSize(_driver) {
      return driver.evaluate(() => window.__applitools.getViewportSize())
    },
    async open(_driver, appName, testName, viewportSize) {
      return driver.evaluate(async options => (window.__eyes = await window.__applitools.openEyes(options)), {
        type: vg ? 'vg' : 'classic',
        concurrency: 10,
        config: {
          apiKey: process.env.APPLITOOLS_API_KEY_SDK,
          appName,
          testName,
          viewportSize,
          batch: {id: process.env.APPLITOOLS_BATCH_ID, name: process.env.APPLITOOLS_BATCH_NAME || 'JS Coverage Tests'},
          parentBranchName: 'master',
          branchName: 'master',
          dontCloseBatches: true,
          matchTimeout: 0,
          saveNewTests: false,
          ...config,
        },
      })
    },
    async check(settings) {
      return driver.evaluate(settings => window.__eyes && window.__eyes.check({settings}), settings)
    },
    async locate(settings) {
      return driver.evaluate(settings => window.__eyes && window.__eyes.locate({settings}), settings)
    },
    async extractText(regions) {
      return driver.evaluate(regions => window.__eyes && window.__eyes.extractText({regions}), regions)
    },
    async extractTextRegions(settings) {
      return driver.evaluate(settings => window.__eyes && window.__eyes.extractTextRegions({settings}), settings)
    },
    async close(throwErr = true) {
      const [result] = await driver.evaluate(throwErr => window.__eyes && window.__eyes.close({throwErr}), throwErr)
      return result
    },
    async abort() {
      return driver.evaluate(() => window.__eyes && window.__eyes.abort())
    },
  }
}

module.exports = setupEyes
