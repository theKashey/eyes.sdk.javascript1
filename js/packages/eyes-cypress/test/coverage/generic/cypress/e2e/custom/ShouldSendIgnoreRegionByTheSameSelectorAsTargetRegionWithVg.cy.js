/* global cy,Cypress*/
const assert = require('assert');
const {getTestInfo} = require('@applitools/test-utils');
describe('Coverage tests', () => {
  it('should send ignore region by the same selector as target region with vg', () => {
    cy.visit('https://applitools.github.io/demo/TestPages/FramesTestPage/');
    cy.eyesOpen({
      appName: 'Eyes Selenium SDK - Fluent API',
      testName: 'TestCheckElementWithIgnoreRegionBySameElement_Fluent_VG',
      viewportSize: {width: 700, height: 460},
    });
    cy.eyesCheckWindow({
      target: 'region',
      selector: {
        selector: '#overflowing-div-image',
      },
      ignore: ['#overflowing-div-image'],
    });
    cy.eyesClose();
    cy.eyesGetAllTestResults().then(async summary => {
      const info = await getTestInfo(
        summary.getAllResults()[0].getTestResults(),
        Cypress.config('appliConfFile').apiKey,
      );
      assert.deepStrictEqual(
        info['actualAppOutput']['0']['imageMatchSettings']['ignore']['0'],
        {left: 0, top: 0, width: 304, height: 185},
        undefined,
      );
    });
  });
});
