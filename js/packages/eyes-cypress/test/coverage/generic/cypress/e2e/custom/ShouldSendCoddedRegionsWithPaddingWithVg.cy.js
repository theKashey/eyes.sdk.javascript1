/* global cy,Cypress*/
const assert = require('assert');
const {getTestInfo} = require('@applitools/test-utils');

describe('Coverage Tests - ShouldSendCoddedRegionsWithPaddingWithVg', () => {
  it('should send accessibility regions by selector with vg', () => {
    cy.visit('https://applitools.github.io/demo/TestPages/PaddedBody/region-padding.html');
    cy.eyesOpen({
      appName: 'Test Regions Padding',
      testName: 'TestRegionsPadding_VG',
      displayName: 'should send codded regions with padding with vg',
      baselineName: 'TestRegionsPadding_VG',
      viewportSize: {width: 700, height: 1100},
    });
    cy.eyesCheckWindow({
      ignore: [{region: '#ignoreRegions', padding: 20}],
      layout: [{region: '#layoutRegions', padding: {top: 20, right: 20}}],
      content: [{region: '#contentRegions', padding: {right: 20, left: 20}}],
      strict: [{region: '#strictRegions', padding: {bottom: 20}}],
    });
    cy.eyesClose();

    cy.eyesGetAllTestResults().then(async summary => {
      const info = await getTestInfo(
        summary.getAllResults()[0].getTestResults(),
        Cypress.config('appliConfFile').apiKey,
      );
      assert.deepStrictEqual(
        info['actualAppOutput']['0']['imageMatchSettings']['ignore'],
        [
          {
            left: 131,
            top: 88,
            width: 838,
            height: 110,
            regionId: '#ignoreRegions',
          },
        ],
        'ignore',
      );
      assert.deepStrictEqual(
        info['actualAppOutput']['0']['imageMatchSettings']['layout'],
        [
          {
            left: 151,
            top: 238,
            width: 818,
            height: 90,
            regionId: '#layoutRegions',
          },
        ],
        'layout',
      );
      assert.deepStrictEqual(
        info['actualAppOutput']['0']['imageMatchSettings']['content'],
        [
          {
            left: 131,
            top: 408,
            width: 838,
            height: 70,
            regionId: '#contentRegions',
          },
        ],
        'content',
      );
      assert.deepStrictEqual(
        info['actualAppOutput']['0']['imageMatchSettings']['strict'],
        [
          {
            left: 151,
            top: 558,
            width: 798,
            height: 548,
            regionId: '#strictRegions',
          },
        ],
        'strict',
      );
    });
  });
});
