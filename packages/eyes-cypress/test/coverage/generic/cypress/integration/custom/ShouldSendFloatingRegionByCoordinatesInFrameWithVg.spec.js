/* global cy,Cypress*/
const assert = require('assert');
const {getTestInfo} = require('@applitools/test-utils');
describe('Coverage tests', () => {
  it('should send floating region by coordinates in frame with vg', () => {
    cy.visit('https://applitools.github.io/demo/TestPages/FramesTestPage/');
    cy.eyesOpen({
      appName: 'Eyes Selenium SDK - Fluent API',
      testName: 'TestCheckRegionInFrame3_Fluent_VG',
      viewportSize: {width: 700, height: 460},
    });
    cy.eyesCheckWindow({
      frames: ['[name="frame1"]'],
      floating: [
        {
          top: 200,
          left: 200,
          width: 150,
          height: 150,
          maxUpOffset: 25,
          maxDownOffset: 25,
          maxLeftOffset: 25,
          maxRightOffset: 25,
        },
      ],
      matchLevel: 'Layout',
      fully: true,
    });
    cy.eyesClose();
    cy.eyesGetAllTestResults().then(async summary => {
      const info = await getTestInfo(
        summary.getAllResults()[0].getTestResults(),
        Cypress.config('appliConfFile').apiKey,
      );
      assert.deepStrictEqual(
        info['actualAppOutput']['0']['imageMatchSettings']['floating']['0'],
        {
          left: 200,
          top: 200,
          width: 150,
          height: 150,
          maxUpOffset: 25,
          maxDownOffset: 25,
          maxLeftOffset: 25,
          maxRightOffset: 25,
        },
        undefined,
      );
    });
  });
});
