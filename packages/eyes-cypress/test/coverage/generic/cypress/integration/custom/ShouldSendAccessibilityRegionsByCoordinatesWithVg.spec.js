/* global cy,Cypress,expect*/
const {getTestInfo} = require('@applitools/test-utils');

describe('Coverage tests', () => {
  it('should send accessibility regions by coordinates with vg', () => {
    cy.visit('https://applitools.github.io/demo/TestPages/FramesTestPage/');
    cy.eyesOpen({
      appName: 'Eyes Selenium SDK - Fluent API',
      displayName: 'should send accessibility regions by coordinates with vg',
      testName: 'TestAccessibilityRegionsByCoordinates_VG',
      viewportSize: {width: 700, height: 460},
      accessibilityValidation: {level: 'AAA', guidelinesVersion: 'WCAG_2_0'},
    });

    cy.eyesCheckWindow({
      accessibility: [
        {accessibilityType: 'LargeText', left: 10, top: 285, width: 800, height: 501},
      ],
    });

    cy.eyesClose();

    cy.eyesGetAllTestResults().then(async summary => {
      const info = await getTestInfo(
        summary.getAllResults()[0].getTestResults(),
        Cypress.config('appliConfFile').apiKey,
      );
      expect(info.actualAppOutput[0].imageMatchSettings.accessibilitySettings).to.eql({
        level: 'AAA',
        version: 'WCAG_2_0',
      });
      expect(info.actualAppOutput[0].imageMatchSettings.accessibility).to.eql([
        {
          isDisabled: false,
          type: 'LargeText',
          left: 10,
          top: 285,
          width: 800,
          height: 501,
        },
      ]);
    });
  });
});
