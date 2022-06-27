'use strict'
const {describe, it} = require('mocha')
const {expect} = require('chai')
const amendRegionIdsToCodedRegions = require('../../../src/sdk/amendRegionIdsToCodedRegions')

describe('amendRegionIdsToCodedRegions', () => {
  it('works', () => {
    const source = {
      ignore: [{left: 0, top: 1, width: 11, height: 12, regionId: undefined}],
      floating: [
        {
          type: 'css',
          selector: '[data-applitools-selector~="bcc54b4c-c7e2-4a48-b83b-abf35203533d"]',
          nodeType: 'element',
          regionId: 'element1',
          maxUpOffset: 4,
          maxDownOffset: 3,
          maxLeftOffset: 2,
          maxRightOffset: 1,
        },
      ],
      accessibility: [
        {
          type: 'css',
          selector: '[data-applitools-selector~="fd667635-3518-43ae-b85d-cd4028d73506"]',
          nodeType: 'element',
          regionId: 'element2',
        },
      ],
      strict: [{left: 90, top: 91, width: 91, height: 92, regionId: undefined}],
      content: [
        {
          type: 'css',
          selector: '[data-applitools-selector~="20da56b8-8eb1-4176-b319-dc15d33183e4"]',
          nodeType: 'element',
          regionId: 'element3',
        },
      ],
      layout: [
        {
          type: 'css',
          selector: '[data-applitools-selector~="57ecaf31-5b55-438b-8c31-4d3cb7425f6c"]',
          nodeType: 'element',
          regionId: 'element4',
        },
      ],
    }
    const destination = {
      ignore: [{width: 11, height: 12, left: 0, top: 1}],
      layout: [{width: 3, height: 4, left: 1, top: 2}],
      strict: [{width: 91, height: 92, left: 90, top: 91}],
      content: [{width: 3, height: 4, left: 1, top: 2}],
      accessibility: [
        {
          width: 3,
          height: 4,
          left: 1,
          top: 2,
          accessibilityType: undefined,
        },
      ],
      floating: [
        {
          width: 3,
          height: 4,
          left: 1,
          top: 2,
          maxUpOffset: 4,
          maxDownOffset: 3,
          maxLeftOffset: 2,
          maxRightOffset: 1,
        },
      ],
    }
    const expected = {
      ignore: [{width: 11, height: 12, left: 0, top: 1}],
      layout: [{width: 3, height: 4, left: 1, top: 2, regionId: 'element4'}],
      strict: [{width: 91, height: 92, left: 90, top: 91}],
      content: [{width: 3, height: 4, left: 1, top: 2, regionId: 'element3'}],
      accessibility: [
        {
          width: 3,
          height: 4,
          left: 1,
          top: 2,
          accessibilityType: undefined,
          regionId: 'element2',
        },
      ],
      floating: [
        {
          width: 3,
          height: 4,
          left: 1,
          top: 2,
          maxUpOffset: 4,
          maxDownOffset: 3,
          maxLeftOffset: 2,
          maxRightOffset: 1,
          regionId: 'element1',
        },
      ],
    }
    expect(amendRegionIdsToCodedRegions({source, destination})).to.be.deep.equal(expected)
  })
})
