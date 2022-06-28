/* global cy,Cypress*/
const assert = require('assert');
const {getTestInfo} = require('@applitools/test-utils');

describe('Coverage tests', () => {
  it('should send ignore displacements with vg', () => {
    cy.visit('https://applitools.github.io/demo/TestPages/FramesTestPage/');
    cy.eyesOpen({
      appName: 'Eyes Selenium SDK - Fluent API',
      testName: 'TestIgnoreDisplacements_VG',
      viewportSize: {width: 700, height: 460},
    });
    cy.eyesCheckWindow({
      ignoreDisplacements: true,
      fully: true,
    });
    cy.eyesClose();
    cy.eyesGetAllTestResults().then(async summary => {
      const info = await getTestInfo(
        summary.getAllResults()[0].getTestResults(),
        Cypress.config('appliConfFile').apiKey,
      );
      assert.deepStrictEqual(
        info['actualAppOutput']['0']['imageMatchSettings']['ignoreDisplacements'],
        true,
        undefined,
      );
    });
  });
});
