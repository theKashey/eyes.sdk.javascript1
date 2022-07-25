/* global cy,Cypress*/
const assert = require('assert');
const {getTestInfo} = require('@applitools/test-utils');

describe('Coverage Tests - ShouldSendCodedRegionByJQueryWithRegionIdAndPaddedWithVg', () => {
  it('should send codded regions by JQuery with region id and padding with vg', () => {
    cy.visit('https://applitools.github.io/demo/TestPages/CodedRegionPage/index.html');
    cy.eyesOpen({
      appName: 'Applitools Eyes SDK',
      testName: 'ShouldSendCodedRegionByJQueryWithRegionIdAndPadded',
      displayName: 'should send codded regions by JQuery with region id and padding with vg',
      baselineName: 'ShouldSendCodedRegionByJQueryWithRegionIdAndPadded',
    });
    cy.get('.region.two:nth-child(2)').then(el => {
      cy.eyesCheckWindow({
        fully: false,
        ignore: [{element: el, regionId: 'my-region-id', padding: {top: 20}}],
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
          left: 280,
          top: 150,
          width: 200,
          height: 220,
          regionId: 'my-region-id',
        },
        undefined,
      );
    });
  });
});
