/* global cy,Cypress*/
const assert = require('assert');
const {getTestInfo} = require('@applitools/test-utils');

describe('Coverage tests', () => {
  it('should send ignore regions by coordinates with vg', () => {
    cy.visit('https://applitools.github.io/demo/TestPages/FramesTestPage/');
    cy.eyesOpen({
      appName: 'Eyes Selenium SDK - Fluent API',
      testName: 'TestCheckFullWindowWithMultipleIgnoreRegionsBySelector_Fluent_VG',
      viewportSize: {width: 700, height: 460},
    });
    cy.eyesCheckWindow({
      ignore: [{selector: '.ignore'}],
    });
    cy.eyesClose();
    cy.eyesGetAllTestResults().then(async summary => {
      const info = await getTestInfo(
        summary.getAllResults()[0].getTestResults(),
        Cypress.config('appliConfFile').apiKey,
      );
      assert.deepStrictEqual(
        info['actualAppOutput']['0']['imageMatchSettings']['ignore']['0'],
        {left: 10, top: 285, width: 800, height: 501},
        undefined,
      );
      assert.deepStrictEqual(
        info['actualAppOutput']['0']['imageMatchSettings']['ignore']['1'],
        {left: 122, top: 932, width: 456, height: 307},
        undefined,
      );
      assert.deepStrictEqual(
        info['actualAppOutput']['0']['imageMatchSettings']['ignore']['2'],
        {left: 8, top: 1276, width: 690, height: 207},
        undefined,
      );
    });
  });
});
