/* global cy,Cypress*/
const assert = require('assert');
const {getTestInfo} = require('@applitools/test-utils');

describe('Coverage tests', () => {
  it('should send ignore region by coordinates with vg', () => {
    cy.visit('https://applitools.github.io/demo/TestPages/FramesTestPage/');
    cy.eyesOpen({
      appName: 'Eyes Selenium SDK - Fluent API',
      testName: 'TestCheckWindowWithIgnoreRegion_Fluent_VG',
      viewportSize: {width: 700, height: 460},
    });
    cy.get('body > input[type=text]').type('My Input');
    cy.eyesCheckWindow({
      ignore: [{x: 50, y: 50, width: 100, height: 100}],
      fully: true,
    });
    cy.eyesClose();
    cy.eyesGetAllTestResults().then(async summary => {
      const info = await getTestInfo(
        summary.getAllResults()[0].getTestResults(),
        Cypress.config('appliConfFile').apiKey,
      );
      assert.deepStrictEqual(
        info['actualAppOutput']['0']['imageMatchSettings']['ignore']['0'],
        {left: 50, top: 50, width: 100, height: 100},
        undefined,
      );
    });
  });
});
