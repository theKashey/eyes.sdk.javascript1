const {appendIndexToDuplicateRegionIds} = require('../../../lib/utils/amend-region-ids')
const assert = require('assert')

describe('amend-region-ids', () => {
  it('append an index for duplicate region ids in a region collection', () => {
    const fakeUfgCodedRegionCollection = [
      {
        type: 'css',
        selector: '[data-applitools-selector~="4227320d-6237-4b2f-8e22-1affc9143f46"]',
        padding: undefined,
        nodeType: 'element',
        regionId: 'css:.region.one:nth-child(1)',
      },
      {
        type: 'css',
        selector: '[data-applitools-selector~="a52219d9-ee9b-421f-822a-514e31e03eea"]',
        padding: undefined,
        nodeType: 'element',
        regionId: 'css:.region.one:nth-child(2)',
      },
      {
        type: 'css',
        selector: '[data-applitools-selector~="efce0400-26b6-4342-80af-b85030792e4b"]',
        padding: undefined,
        nodeType: 'element',
        regionId: 'xpath://div[@class="region one"][3]',
      },
      {
        type: 'css',
        selector: '[data-applitools-selector~="bbf0df63-7595-40f2-82ac-289629bbecc3"]',
        padding: undefined,
        nodeType: 'element',
        regionId: 'css:.region.one:nth-child(4)',
      },
      {
        type: 'css',
        selector: '[data-applitools-selector~="442ba9f4-6a9c-4e9e-8acc-78b8e8c1edf7"]',
        padding: undefined,
        nodeType: 'element',
        regionId: 'xpath://div[@class="region one"][5]',
      },
      {
        type: 'css',
        selector: '[data-applitools-selector~="137954cb-9107-41cc-8637-81a114506547"]',
        padding: undefined,
        nodeType: 'element',
        regionId: undefined,
      },
      {
        type: 'css',
        selector: '[data-applitools-selector~="8997bc69-9a41-43d2-a60a-a2f243874b5b"]',
        padding: undefined,
        nodeType: 'element',
        regionId: undefined,
      },
      {
        type: 'css',
        selector: '[data-applitools-selector~="acda1ca7-8f09-4899-99d0-91fc3b9bbb90"]',
        padding: undefined,
        nodeType: 'element',
        regionId: undefined,
      },
      {
        type: 'css',
        selector: '[data-applitools-selector~="1edb1d85-2b35-4ca8-8c01-9324431e675c"]',
        padding: undefined,
        nodeType: 'element',
        regionId: 'css:.region.three:nth-child(3n)',
      },
      {
        type: 'css',
        selector: '[data-applitools-selector~="7c4fa734-0dcc-4563-88d9-898a0461f4cd"]',
        padding: undefined,
        nodeType: 'element',
        regionId: 'css:.region.three:nth-child(3n)',
      },
      {
        type: 'css',
        selector: '[data-applitools-selector~="29fc43cb-4745-4322-a9bc-8e945a33d120"]',
        padding: undefined,
        nodeType: 'element',
        regionId: 'css:.region.three:nth-child(3n)',
      },
      {
        type: 'css',
        selector: '[data-applitools-selector~="2066c095-5666-4efb-b0cd-16c29efd59eb"]',
        padding: undefined,
        nodeType: 'element',
        regionId: 'css:.region.three:nth-child(3n)',
      },
    ]
    const expected = [
      {
        type: 'css',
        selector: '[data-applitools-selector~="4227320d-6237-4b2f-8e22-1affc9143f46"]',
        padding: undefined,
        nodeType: 'element',
        regionId: 'css:.region.one:nth-child(1)',
      },
      {
        type: 'css',
        selector: '[data-applitools-selector~="a52219d9-ee9b-421f-822a-514e31e03eea"]',
        padding: undefined,
        nodeType: 'element',
        regionId: 'css:.region.one:nth-child(2)',
      },
      {
        type: 'css',
        selector: '[data-applitools-selector~="efce0400-26b6-4342-80af-b85030792e4b"]',
        padding: undefined,
        nodeType: 'element',
        regionId: 'xpath://div[@class="region one"][3]',
      },
      {
        type: 'css',
        selector: '[data-applitools-selector~="bbf0df63-7595-40f2-82ac-289629bbecc3"]',
        padding: undefined,
        nodeType: 'element',
        regionId: 'css:.region.one:nth-child(4)',
      },
      {
        type: 'css',
        selector: '[data-applitools-selector~="442ba9f4-6a9c-4e9e-8acc-78b8e8c1edf7"]',
        padding: undefined,
        nodeType: 'element',
        regionId: 'xpath://div[@class="region one"][5]',
      },
      {
        type: 'css',
        selector: '[data-applitools-selector~="137954cb-9107-41cc-8637-81a114506547"]',
        padding: undefined,
        nodeType: 'element',
        regionId: undefined,
      },
      {
        type: 'css',
        selector: '[data-applitools-selector~="8997bc69-9a41-43d2-a60a-a2f243874b5b"]',
        padding: undefined,
        nodeType: 'element',
        regionId: undefined,
      },
      {
        type: 'css',
        selector: '[data-applitools-selector~="acda1ca7-8f09-4899-99d0-91fc3b9bbb90"]',
        padding: undefined,
        nodeType: 'element',
        regionId: undefined,
      },
      {
        type: 'css',
        selector: '[data-applitools-selector~="1edb1d85-2b35-4ca8-8c01-9324431e675c"]',
        padding: undefined,
        nodeType: 'element',
        regionId: 'css:.region.three:nth-child(3n) (1)',
      },
      {
        type: 'css',
        selector: '[data-applitools-selector~="7c4fa734-0dcc-4563-88d9-898a0461f4cd"]',
        padding: undefined,
        nodeType: 'element',
        regionId: 'css:.region.three:nth-child(3n) (2)',
      },
      {
        type: 'css',
        selector: '[data-applitools-selector~="29fc43cb-4745-4322-a9bc-8e945a33d120"]',
        padding: undefined,
        nodeType: 'element',
        regionId: 'css:.region.three:nth-child(3n) (3)',
      },
      {
        type: 'css',
        selector: '[data-applitools-selector~="2066c095-5666-4efb-b0cd-16c29efd59eb"]',
        padding: undefined,
        nodeType: 'element',
        regionId: 'css:.region.three:nth-child(3n) (4)',
      },
    ]
    assert.deepStrictEqual(appendIndexToDuplicateRegionIds(fakeUfgCodedRegionCollection), expected)
  })
})
