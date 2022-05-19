/* global cy,Cypress,expect*/
const {getTestInfo} = require('@applitools/test-utils');

describe('Coverage tests', () => {
  it('should send ignore region by DOM element with vg', () => {
    cy.visit('https://applitools.github.io/demo/TestPages/FramesTestPage/');
    cy.eyesOpen({
      appName: 'Eyes Selenium SDK - Fluent API',
      displayName: 'should send ignore region by DOM element with vg',
      testName: 'TestIgnoreRegionByDomElement_VG',
      viewportSize: {width: 700, height: 460},
    });

    cy.get('#overflowing-div').then($el => {
      cy.eyesCheckWindow({
        ignore: $el[0],
      });
    });

    cy.eyesClose();

    cy.eyesGetAllTestResults().then(async summary => {
      const info = await getTestInfo(
        summary.getAllResults()[0].getTestResults(),
        Cypress.config('appliConfFile').apiKey,
      );
      expect(
        info['actualAppOutput']['0']['imageMatchSettings']['ignore']['0'],
        {left: 8, top: 80, width: 304, height: 185},
        undefined,
      );
    });
  });
});
