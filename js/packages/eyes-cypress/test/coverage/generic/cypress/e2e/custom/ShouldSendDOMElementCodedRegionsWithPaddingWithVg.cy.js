/* global cy,Cypress*/
const assert = require('assert');
const {getTestInfo} = require('@applitools/test-utils');

describe('Coverage Tests - ShouldSendCoddedRegionByDomWithPaddingWithVg', () => {
  it('should send coded regions by DOM element with vg', () => {
    cy.visit('https://applitools.github.io/demo/TestPages/PaddedBody/region-padding.html');
    cy.eyesOpen({
      appName: 'Test Regions Padding',
      testName: 'TestRegionsPadding_VG',
      displayName: 'should send codded regions with padding using DOM element with vg',
      baselineName: 'TestRegionsPaddingDOMElement_VG',
      viewportSize: {width: 1100, height: 700},
    });

    cy.get('#layoutRegions').then($el => {
      cy.eyesCheckWindow({
        layout: {element: $el[0], padding: {top: 20, right: 20}},
      });
    });

    cy.eyesClose();

    cy.eyesGetAllTestResults().then(async summary => {
      const info = await getTestInfo(
        summary.getAllResults()[0].getTestResults(),
        Cypress.config('appliConfFile').apiKey,
      );
      assert.deepStrictEqual(
        info['actualAppOutput']['0']['imageMatchSettings']['layout'],
        [
          {
            left: 151,
            top: 238,
            width: 818,
            height: 90,
          },
        ],
        'layout',
      );
    });
  });
});
