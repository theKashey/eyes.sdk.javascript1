/* global cy,Cypress*/
const assert = require('assert');
const {getTestInfo} = require('@applitools/test-utils');
describe('Coverage tests', () => {
  it('should send ignore region by selector with vg', () => {
    cy.visit('https://applitools.github.io/demo/TestPages/FramesTestPage/');
    cy.eyesOpen({
      appName: 'Eyes Selenium SDK - Fluent API',
      testName: 'TestCheckWindowWithIgnoreBySelector_Fluent_VG',
      viewportSize: {width: 700, height: 460},
    });
    cy.eyesCheckWindow({
      ignore: [{selector: '#overflowing-div'}],
    });
    cy.eyesClose();

    cy.eyesGetAllTestResults().then(async summary => {
      const info = await getTestInfo(
        summary.getAllResults()[0].getTestResults(),
        Cypress.config('appliConfFile').apiKey,
      );
      assert.deepStrictEqual(
        info['actualAppOutput']['0']['imageMatchSettings']['ignore']['0'],
        {left: 8, top: 80, width: 304, height: 185},
        undefined,
      );
    });
  });
});
