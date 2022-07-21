/* global cy,Cypress*/
const assert = require('assert');
const {getTestInfo} = require('@applitools/test-utils');

describe('Coverage Tests - ShouldSendCoddedRegionsWithSelectorWithCustomRegionIdWithVg', () => {
  it('should send coded regions with regionId with custom selector with regionId with vg', () => {
    cy.visit('https://applitools.github.io/demo/TestPages/CodedRegionPage/index.html');
    cy.eyesOpen({
      appName: 'Applitools Eyes SDK',
      testName: 'ShouldSendCoddedRegionsWithSelectorWithCustomRegionIdWithVg',
      displayName: 'should send codded regions with selector with custom region id with vg',
      baselineName: 'ShouldSendCoddedRegionsWithCustomRegionIdWithVg',
    });

    cy.eyesCheckWindow({
      fully: false,
      ignore: [
        {
          type: 'css',
          selector: 'body > div:nth-child(3) > div:nth-child(3)',
          regionId: 'my-region-id',
        },
      ],
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
          left: 250,
          top: 420,
          width: 50,
          height: 50,
          regionId: 'my-region-id',
        },
        undefined,
      );
    });
  });
});
