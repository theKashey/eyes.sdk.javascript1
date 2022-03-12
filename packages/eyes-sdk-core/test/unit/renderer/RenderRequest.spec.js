'use strict'

const assert = require('assert')

const {RenderRequest} = require('../../../index')

describe('RenderRequest', () => {
  describe('constructor', () => {
    it('fills values', () => {
      const renderRequest = new RenderRequest({
        webhook: 'webhook',
        stitchingService: 'stitchingService',
        url: 'url',
        dom: 'dom',
        resources: 'resources',
        renderInfo: 'renderInfo',
        platform: 'platform',
        browserName: 'browserName',
        scriptHooks: 'scriptHooks',
        selectorsToFindRegionsFor: 'selectorsToFindRegionsFor',
        sendDom: 'sendDom',
        visualGridOptions: {polyfillAdoptedStyleSheets: true},
      })
      assert.strictEqual(renderRequest.getWebhook(), 'webhook')
      assert.strictEqual(renderRequest.getUrl(), 'url')
      assert.strictEqual(renderRequest.getDom(), 'dom')
      assert.strictEqual(renderRequest.getResources(), 'resources')
      assert.strictEqual(renderRequest.getRenderInfo(), 'renderInfo')
      assert.strictEqual(renderRequest.getPlatform(), 'platform')
      assert.strictEqual(renderRequest.getBrowserName(), 'browserName')
      assert.strictEqual(renderRequest.getScriptHooks(), 'scriptHooks')
      assert.strictEqual(renderRequest.getSelectorsToFindRegionsFor(), 'selectorsToFindRegionsFor')
      assert.strictEqual(renderRequest.getSendDom(), 'sendDom')
      assert.strictEqual(renderRequest.getStitchingService(), 'stitchingService')
      assert.deepStrictEqual(renderRequest.getVisualGridOptions(), {
        polyfillAdoptedStyleSheets: true,
      })
    })
  })

  describe('toJSON', () => {
    it('returns the correct object', () => {
      const renderInfo = {
        toJSON() {
          return 'renderInfoToJSON'
        },
      }

      const renderRequest = new RenderRequest({
        webhook: 'webhook',
        url: 'url',
        resources: 'resources',
        dom: 'dom',
        renderInfo,
        platform: 'platform',
        browserName: 'browserName',
        scriptHooks: 'scriptHooks',
        selectorsToFindRegionsFor: 'selectorsToFindRegionsFor',
        sendDom: 'sendDom',
        visualGridOptions: {polyfillAdoptedStyleSheets: true},
        enableMultipleResultsPerSelector: true,
      })
      const expected = {
        stitchingService: undefined,
        webhook: 'webhook',
        url: 'url',
        dom: 'dom',
        resources: 'resources',
        renderInfo: 'renderInfoToJSON',
        browser: {
          name: 'browserName',
        },
        platform: {
          name: 'platform',
        },
        scriptHooks: 'scriptHooks',
        selectorsToFindRegionsFor: 'selectorsToFindRegionsFor',
        sendDom: 'sendDom',
        options: {polyfillAdoptedStyleSheets: true},
        enableMultipleResultsPerSelector: true,
      }
      assert.deepStrictEqual(renderRequest.toJSON(), expected)
    })
  })

  describe('toString', () => {
    it('returns the correct string', () => {
      const renderInfo = {
        toJSON() {
          return 'renderInfoToJSON'
        },
      }

      const renderRequest = new RenderRequest({
        webhook: 'webhook',
        url: 'url',
        dom: 'dom',
        resources: 'resources',
        renderInfo,
        platform: 'platform',
        browserName: 'browserName',
        scriptHooks: 'scriptHooks',
        selectorsToFindRegionsFor: 'selectorsToFindRegionsFor',
        sendDom: 'sendDom',
        visualGridOptions: {polyfillAdoptedStyleSheets: true},
        enableMultipleResultsPerSelector: true,
      })
      assert.strictEqual(
        renderRequest.toString(),
        'RenderRequest { {"webhook":"webhook","url":"url","dom":"dom","resources":"resources","enableMultipleResultsPerSelector":true,"browser":{"name":"browserName"},"platform":{"name":"platform"},"renderInfo":"renderInfoToJSON","scriptHooks":"scriptHooks","selectorsToFindRegionsFor":"selectorsToFindRegionsFor","sendDom":"sendDom","options":{"polyfillAdoptedStyleSheets":true}} }',
      )
    })
  })
})
