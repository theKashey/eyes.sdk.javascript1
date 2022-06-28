const assert = require('assert')
const {transformConfig, transformCheckSettings} = require('../../dist/legacy')

describe('util', () => {
  describe('translate check args to check settings', () => {
    it('tag', () => {
      const args = {
        tag: 'blah',
      }
      const checkSettings = transformCheckSettings(args)
      assert.deepStrictEqual(checkSettings.name, args.tag)
    })
    it('window fully', () => {
      const args = {
        target: 'window',
        fully: true,
      }
      const checkSettings = transformCheckSettings(args)
      assert.deepStrictEqual(checkSettings.fully, args.fully)
    })
    it('region selector', () => {
      const args = {
        target: 'region',
        selector: '#overflowing-div',
      }
      const checkSettings = transformCheckSettings(args)
      assert.deepStrictEqual(checkSettings.region, args.selector)
    })
    it('region', () => {
      const args = {target: 'region', region: {top: 100, left: 0, width: 1000, height: 200}}
      const checkSettings = transformCheckSettings(args)
      assert.deepStrictEqual(checkSettings.region, args.region)
    })
    it('ignore', async () => {
      const args = {
        ignore: [{selector: '#overflowing-div'}, {top: 100, left: 0, width: 1000, height: 200}],
      }
      const checkSettings = transformCheckSettings(args)
      assert.deepStrictEqual(checkSettings.ignoreRegions.length, args.ignore.length)
      assert.deepStrictEqual(checkSettings.ignoreRegions[0], args.ignore[0].selector)
      assert.deepStrictEqual(checkSettings.ignoreRegions[1], args.ignore[1])
    })
    it('floating', async () => {
      const args = {
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
      }
      const checkSettings = transformCheckSettings(args)
      assert.deepStrictEqual(checkSettings.floatingRegions.length, args.floating.length)
      assert.deepStrictEqual(checkSettings.floatingRegions[0].region.top, args.floating[0].top)
      assert.deepStrictEqual(checkSettings.floatingRegions[0].region.left, args.floating[0].left)
      assert.deepStrictEqual(checkSettings.floatingRegions[0].region.width, args.floating[0].width)
      assert.deepStrictEqual(checkSettings.floatingRegions[0].region.height, args.floating[0].height)
      assert.deepStrictEqual(checkSettings.floatingRegions[0].maxUpOffset, args.floating[0].maxUpOffset)
      assert.deepStrictEqual(checkSettings.floatingRegions[0].maxDownOffset, args.floating[0].maxDownOffset)
      assert.deepStrictEqual(checkSettings.floatingRegions[0].maxLeftOffset, args.floating[0].maxLeftOffset)
      assert.deepStrictEqual(checkSettings.floatingRegions[0].maxRightOffset, args.floating[0].maxRightOffset)
      assert.deepStrictEqual(checkSettings.floatingRegions[1].region, args.floating[1].selector)
      assert.deepStrictEqual(checkSettings.floatingRegions[1].maxUpOffset, args.floating[1].maxUpOffset)
      assert.deepStrictEqual(checkSettings.floatingRegions[1].maxDownOffset, args.floating[1].maxDownOffset)
      assert.deepStrictEqual(checkSettings.floatingRegions[1].maxLeftOffset, args.floating[1].maxLeftOffset)
      assert.deepStrictEqual(checkSettings.floatingRegions[1].maxRightOffset, args.floating[1].maxRightOffset)
    })
    it('layout', () => {
      const args = {
        layout: [{top: 100, left: 0, width: 1000, height: 100}, {selector: '#overflowing-div'}],
      }
      const checkSettings = transformCheckSettings(args)
      assert.deepStrictEqual(checkSettings.layoutRegions.length, args.layout.length)
    })
    it('strict', () => {
      const args = {
        strict: [{top: 100, left: 0, width: 1000, height: 100}, {selector: '#overflowing-div'}],
      }
      const checkSettings = transformCheckSettings(args)
      assert.deepStrictEqual(checkSettings.strictRegions.length, args.strict.length)
    })
    it('content', () => {
      const args = {
        content: [{top: 100, left: 0, width: 1000, height: 100}, {selector: '#overflowing-div'}],
      }
      const checkSettings = transformCheckSettings(args)
      assert.deepStrictEqual(checkSettings.contentRegions.length, args.content.length)
    })
    it('accessibility', () => {
      const args = {
        accessibility: [
          {accessibilityType: 'RegularText', selector: '#overflowing-div'},
          {accessibilityType: 'BoldText', top: 100, left: 0, width: 1000, height: 100},
        ],
      }
      const checkSettings = transformCheckSettings(args)
      assert.deepStrictEqual(checkSettings.accessibilityRegions.length, args.accessibility.length)
    })
    it('scriptsHooks', () => {
      const args = {
        scriptHooks: {
          beforeCaptureScreenshot: "document.body.style.backgroundColor = 'gold'",
        },
      }
      const checkSettings = transformCheckSettings(args)
      assert.deepStrictEqual(checkSettings.hooks, args.scriptHooks)
    })
    it('sendDom', () => {
      const args = {sendDom: false}
      const checkSettings = transformCheckSettings(args)
      assert.deepStrictEqual(checkSettings.sendDom, args.sendDom)
    })
    it('enablePatterns', () => {
      const args = {enablePatterns: true}
      const checkSettings = transformCheckSettings(args)
      assert.deepStrictEqual(checkSettings.enablePatterns, args.enablePatterns)
    })
  })
  describe('translate open args to config', () => {
    it('works', () => {
      const args = {
        testName: 'test-name',
        browser: [{width: 1024, height: 768, name: 'ie11'}],
        batchId: 'batch-id',
        batchName: 'batch-name',
        baselineEnvName: 'baseline-env-name',
        envName: 'env-name',
        ignoreCaret: true,
        matchLevel: 'None',
        baselineBranchName: 'baseline-branch-name',
        saveFailedTests: true,
        saveNewTests: true,
        properties: [{name: 'My prop', value: 'My value'}],
        ignoreDisplacements: true,
        compareWithParentBranch: true,
        ignoreBaseline: true,
        notifyOnCompletion: true,
        accessibilityValidation: {level: 'AA', guidelinesVersion: 'WCAG_2_0'},
        showLogs: true,
      }
      const config = transformConfig(args)
      assert.deepStrictEqual(config.testName, args.testName)
      assert.deepStrictEqual(config.browsersInfo, args.browser)
      assert.deepStrictEqual(config.batch.name, args.batchName)
      assert.deepStrictEqual(config.batch.id, args.batchId)
      assert.deepStrictEqual(config.batch.notifyOnCompletion, args.notifyOnCompletion)
      assert.deepStrictEqual(config.baselineEnvName, args.baselineEnvName)
      assert.deepStrictEqual(config.environmentName, args.envName)
      assert.deepStrictEqual(config.defaultMatchSettings.ignoreCaret, args.ignoreCaret)
      assert.deepStrictEqual(config.defaultMatchSettings.matchLevel, args.matchLevel)
      assert.deepStrictEqual(config.baselineBranchName, args.baselineBranchName)
      assert.deepStrictEqual(config.parentBranchName, args.parentBranchName)
      assert.deepStrictEqual(config.saveFailedTests, args.saveFailedTests)
      assert.deepStrictEqual(config.saveNewTests, args.saveNewTests)
      assert.deepStrictEqual(config.properties, args.properties)
      assert.deepStrictEqual(config.defaultMatchSettings.ignoreDisplacements, args.ignoreDisplacements)
      assert.deepStrictEqual(config.compareWithParentBranch, args.compareWithParentBranch)
      assert.deepStrictEqual(config.ignoreBaseline, args.ignoreBaseline)
      assert.deepStrictEqual(config.defaultMatchSettings.accessibilitySettings, args.accessibilityValidation)
      assert.deepStrictEqual(config.showLogs, args.showLogs)
    })
    it('skips undefined entries', () => {
      const config = transformConfig({})
      assert.deepStrictEqual(config, {})
    })
  })
  describe('translate applitools.config.js file contents to config', () => {
    it('works', () => {
      const args = {
        apiKey: 'asdf',
        showLogs: true,
        serverUrl: 'https://blah',
        proxy: 'https://username:password@myproxy.com:443',
        isDisabled: true,
        failTestcafeOnDiff: false,
        tapDirPath: process.cwd(),
        dontCloseBatches: true,
        disableBrowserFetching: true,
      }
      const config = transformConfig(args)
      assert.deepStrictEqual(config.apiKey, args.apiKey)
      assert.deepStrictEqual(config.showLogs, args.showLogs)
      assert.deepStrictEqual(config.serverUrl, args.serverUrl)
      assert.deepStrictEqual(config.proxy.url, args.proxy)
      assert.deepStrictEqual(config.isDisabled, args.isDisabled)
      assert.deepStrictEqual(config.dontCloseBatches, args.dontCloseBatches)
      assert.deepStrictEqual(config.disableBrowserFetching, args.disableBrowserFetching)
      assert.deepStrictEqual(config.failTestcafeOnDiff, args.failTestcafeOnDiff)
      assert.deepStrictEqual(config.tapDirPath, args.tapDirPath)
    })
  })
})
