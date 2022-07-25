/* global cy,Cypress*/
const assert = require('assert');
const {getTestInfo} = require('@applitools/test-utils');

describe('Coverage Tests - ShouldSendCoddedRegionsWithRegionIdWithVg', () => {
  it('should send coded regions with padding with vg', () => {
    cy.visit('https://applitools.github.io/demo/TestPages/CodedRegionPage/index.html');
    cy.eyesOpen({
      appName: 'Applitools Eyes SDK',
      testName: 'ShouldSendCoddedRegionsWithRegionIdWithVg',
      displayName: 'should send codded regions with region id with vg',
      baselineName: 'ShouldSendCoddedRegionsWithRegionIdWithVg',
    });
    cy.get('.region.two:nth-child(2)').then(el => {
      cy.eyesCheckWindow({
        fully: false,
        ignore: [
          {type: 'css', selector: '.region.three:nth-child(3n)'},
          {type: 'xpath', selector: '//div[@class="region one"][3]'},
          {element: el, regionId: 'my-region-id'},
        ],
      });
      cy.eyesCheckWindow({
        fully: false,
        layout: [
          {type: 'css', selector: '.region.three:nth-child(3n)'},
          {type: 'xpath', selector: '//div[@class="region one"][3]'},
          {element: el, regionId: 'my-region-id'},
        ],
      });
      cy.eyesCheckWindow({
        fully: false,
        content: [
          {type: 'css', selector: '.region.three:nth-child(3n)'},
          {type: 'xpath', selector: '//div[@class="region one"][3]'},
          {element: el, regionId: 'my-region-id'},
        ],
      });
      cy.eyesCheckWindow({
        fully: false,
        strict: [
          {type: 'css', selector: '.region.three:nth-child(3n)'},
          {type: 'xpath', selector: '//div[@class="region one"][3]'},
          {element: el, regionId: 'my-region-id'},
        ],
      });
    });

    cy.eyesClose();

    cy.eyesGetAllTestResults().then(async summary => {
      const info = await getTestInfo(
        summary.getAllResults()[0].getTestResults(),
        Cypress.config('appliConfFile').apiKey,
      );
      assert.deepStrictEqual(
        info['actualAppOutput']['0']['imageMatchSettings']['ignore']['0'],
        {
          left: 290,
          top: 30,
          width: 100,
          height: 100,
          regionId: '//div[@class="region one"][3]',
        },
        undefined,
      );
      assert.deepStrictEqual(
        info['actualAppOutput']['1']['imageMatchSettings']['layout']['0'],
        {
          left: 290,
          top: 30,
          width: 100,
          height: 100,
          regionId: '//div[@class="region one"][3]',
        },
        undefined,
      );
      assert.deepStrictEqual(
        info['actualAppOutput']['2']['imageMatchSettings']['content']['0'],
        {
          left: 290,
          top: 30,
          width: 100,
          height: 100,
          regionId: '//div[@class="region one"][3]',
        },
        undefined,
      );
      assert.deepStrictEqual(
        info['actualAppOutput']['3']['imageMatchSettings']['strict']['0'],
        {
          left: 290,
          top: 30,
          width: 100,
          height: 100,
          regionId: '//div[@class="region one"][3]',
        },
        undefined,
      );
      assert.deepStrictEqual(
        info['actualAppOutput']['0']['imageMatchSettings']['ignore']['1'],
        {left: 280, top: 170, width: 200, height: 200, regionId: 'my-region-id'},
        undefined,
      );
      assert.deepStrictEqual(
        info['actualAppOutput']['1']['imageMatchSettings']['layout']['1'],
        {left: 280, top: 170, width: 200, height: 200, regionId: 'my-region-id'},
        undefined,
      );
      assert.deepStrictEqual(
        info['actualAppOutput']['2']['imageMatchSettings']['content']['1'],
        {left: 280, top: 170, width: 200, height: 200, regionId: 'my-region-id'},
        undefined,
      );
      assert.deepStrictEqual(
        info['actualAppOutput']['3']['imageMatchSettings']['strict']['1'],
        {left: 280, top: 170, width: 200, height: 200, regionId: 'my-region-id'},
        undefined,
      );
      assert.deepStrictEqual(
        info['actualAppOutput']['0']['imageMatchSettings']['ignore']['2'],
        {
          left: 250,
          top: 420,
          width: 50,
          height: 50,
          regionId: '.region.three:nth-child(3n) (1)',
        },
        undefined,
      );
      assert.deepStrictEqual(
        info['actualAppOutput']['1']['imageMatchSettings']['layout']['2'],
        {
          left: 250,
          top: 420,
          width: 50,
          height: 50,
          regionId: '.region.three:nth-child(3n) (1)',
        },
        undefined,
      );
      assert.deepStrictEqual(
        info['actualAppOutput']['2']['imageMatchSettings']['content']['2'],
        {
          left: 250,
          top: 420,
          width: 50,
          height: 50,
          regionId: '.region.three:nth-child(3n) (1)',
        },
        undefined,
      );
      assert.deepStrictEqual(
        info['actualAppOutput']['3']['imageMatchSettings']['strict']['2'],
        {
          left: 250,
          top: 420,
          width: 50,
          height: 50,
          regionId: '.region.three:nth-child(3n) (1)',
        },
        undefined,
      );
      assert.deepStrictEqual(
        info['actualAppOutput']['0']['imageMatchSettings']['ignore']['3'],
        {
          left: 550,
          top: 420,
          width: 50,
          height: 50,
          regionId: '.region.three:nth-child(3n) (2)',
        },
        undefined,
      );
      assert.deepStrictEqual(
        info['actualAppOutput']['1']['imageMatchSettings']['layout']['3'],
        {
          left: 550,
          top: 420,
          width: 50,
          height: 50,
          regionId: '.region.three:nth-child(3n) (2)',
        },
        undefined,
      );
      assert.deepStrictEqual(
        info['actualAppOutput']['2']['imageMatchSettings']['content']['3'],
        {
          left: 550,
          top: 420,
          width: 50,
          height: 50,
          regionId: '.region.three:nth-child(3n) (2)',
        },
        undefined,
      );
      assert.deepStrictEqual(
        info['actualAppOutput']['3']['imageMatchSettings']['strict']['3'],
        {
          left: 550,
          top: 420,
          width: 50,
          height: 50,
          regionId: '.region.three:nth-child(3n) (2)',
        },
        undefined,
      );
      assert.deepStrictEqual(
        info['actualAppOutput']['0']['imageMatchSettings']['ignore']['4'],
        {
          left: 250,
          top: 520,
          width: 50,
          height: 50,
          regionId: '.region.three:nth-child(3n) (3)',
        },
        undefined,
      );
      assert.deepStrictEqual(
        info['actualAppOutput']['1']['imageMatchSettings']['layout']['4'],
        {
          left: 250,
          top: 520,
          width: 50,
          height: 50,
          regionId: '.region.three:nth-child(3n) (3)',
        },
        undefined,
      );
      assert.deepStrictEqual(
        info['actualAppOutput']['2']['imageMatchSettings']['content']['4'],
        {
          left: 250,
          top: 520,
          width: 50,
          height: 50,
          regionId: '.region.three:nth-child(3n) (3)',
        },
        undefined,
      );
      assert.deepStrictEqual(
        info['actualAppOutput']['3']['imageMatchSettings']['strict']['4'],
        {
          left: 250,
          top: 520,
          width: 50,
          height: 50,
          regionId: '.region.three:nth-child(3n) (3)',
        },
        undefined,
      );
      assert.deepStrictEqual(
        info['actualAppOutput']['0']['imageMatchSettings']['ignore']['5'],
        {
          left: 550,
          top: 520,
          width: 50,
          height: 50,
          regionId: '.region.three:nth-child(3n) (4)',
        },
        undefined,
      );
      assert.deepStrictEqual(
        info['actualAppOutput']['1']['imageMatchSettings']['layout']['5'],
        {
          left: 550,
          top: 520,
          width: 50,
          height: 50,
          regionId: '.region.three:nth-child(3n) (4)',
        },
        undefined,
      );
      assert.deepStrictEqual(
        info['actualAppOutput']['2']['imageMatchSettings']['content']['5'],
        {
          left: 550,
          top: 520,
          width: 50,
          height: 50,
          regionId: '.region.three:nth-child(3n) (4)',
        },
        undefined,
      );
      assert.deepStrictEqual(
        info['actualAppOutput']['3']['imageMatchSettings']['strict']['5'],
        {
          left: 550,
          top: 520,
          width: 50,
          height: 50,
          regionId: '.region.three:nth-child(3n) (4)',
        },
        undefined,
      );
    });
  });
});
