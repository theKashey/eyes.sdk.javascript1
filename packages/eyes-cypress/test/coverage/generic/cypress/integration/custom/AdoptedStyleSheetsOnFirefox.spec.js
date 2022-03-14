/* global cy*/

describe('Coverage tests', () => {
  it('adopted styleSheets on firefox', () => {
    cy.visit('https://applitools.github.io/demo/TestPages/AdoptedStyleSheets/index.html');
    cy.eyesOpen({
      appName: 'Applitools Eyes SDK',
      testName: 'AdoptedStyleSheetsOnFirefox',
      viewportSize: {width: 700, height: 460},
      baselineEnvName: 'AdoptedStyleSheetsOnFirefox',
      displayName: 'adopted styleSheets on firefox',
      browser: [{name: 'firefox', width: 640, height: 480}],
    });
    cy.eyesCheckWindow({
      visualGridOptions: {polyfillAdoptedStyleSheets: true},
    });
    cy.eyesCheckWindow({
      visualGridOptions: {polyfillAdoptedStyleSheets: false},
    });
    cy.eyesClose();
  });
});
