/* global cy,Cypress*/
const assert = require('assert');
const {getTestInfo} = require('@applitools/test-utils');
describe('Coverage tests', () => {
  it('should send floating region by DOM element with vg', () => {
    cy.visit('https://applitools.github.io/demo/TestPages/FramesTestPage/');
    cy.eyesOpen({
      appName: 'Eyes Selenium SDK - Fluent API',
      testName: 'TestCheckWindowWithFloatingByDomElement_Fluent_VG',
      viewportSize: {width: 700, height: 460},
    });
    cy.get('#overflowing-div').then($el => {
      cy.eyesCheckWindow({
        floating: [
          {
            element: $el[0],
            maxUpOffset: 3,
            maxDownOffset: 3,
            maxLeftOffset: 20,
            maxRightOffset: 30,
          },
        ],
      });
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
        },
        undefined,
      );
    });
  });
});
