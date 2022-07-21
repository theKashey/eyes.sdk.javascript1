/* global cy,Cypress*/
const assert = require('assert');
const {getTestInfo} = require('@applitools/test-utils');

describe('Coverage Tests - ShouldSendCoddedRegionsWithPaddingWithVg', () => {
  it('should send coded regions by JQuery element with vg', () => {
    cy.visit('https://applitools.github.io/demo/TestPages/PaddedBody/region-padding.html');
    cy.eyesOpen({
      appName: 'Test Regions Padding',
      testName: 'TestRegionsPadding_VG',
      displayName: 'should send codded regions with padding using JQuery element with vg',
      baselineName: 'TestRegionsPaddingJQueryElement_VG',
      viewportSize: {width: 1100, height: 700},
    });

    cy.get('#ignoreRegions').then($el => {
      cy.eyesCheckWindow({
        ignore: {element: $el, padding: 20},
      });
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
    });
  });
});
