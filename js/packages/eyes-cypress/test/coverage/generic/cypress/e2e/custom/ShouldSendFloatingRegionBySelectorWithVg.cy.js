/* global cy,Cypress*/
const assert = require('assert');
const {getTestInfo} = require('@applitools/test-utils');
describe('Coverage tests', () => {
  it('should send floating region by selector with vg', () => {
    cy.visit('https://applitools.github.io/demo/TestPages/FramesTestPage/');
    cy.eyesOpen({
      appName: 'Eyes Selenium SDK - Fluent API',
      testName: 'TestCheckWindowWithFloatingBySelector_Fluent_VG',
      viewportSize: {width: 700, height: 460},
    });

    cy.eyesCheckWindow({
      floating: [
        {
          selector: '#overflowing-div',
          maxDownOffset: 3,
          maxLeftOffset: 20,
          maxRightOffset: 30,
          maxUpOffset: 3,
        },
        {
          region: {
            selector: 'body > iframe',
          },
          maxDownOffset: 3,
          maxLeftOffset: 20,
          maxRightOffset: 30,
          maxUpOffset: 3,
          regionId: 'floating-regionId',
          padding: {top: 20},
        },
      ],
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
          left: 8,
          top: 80,
          width: 304,
          height: 185,
          maxUpOffset: 3,
          maxDownOffset: 3,
          maxLeftOffset: 20,
          maxRightOffset: 30,
          regionId: '#overflowing-div',
        },
        undefined,
      );
      assert.deepStrictEqual(
        info['actualAppOutput']['0']['imageMatchSettings']['floating']['1'],
        {
          left: 58,
          top: 485,
          width: 504,
          height: 425,
          maxUpOffset: 3,
          maxDownOffset: 3,
          maxLeftOffset: 20,
          maxRightOffset: 30,
          regionId: 'floating-regionId',
        },
        undefined,
      );
    });
  });
});
