/* globals describe,it,cy */
describe('jslayout', () => {
  it('works', () => {
    cy.visit('https://applitools.github.io/demo/TestPages/JsLayout/');

    cy.eyesOpen({
      showLogs: true,
      appName: 'cypress play around',
      testName: 'cypress play around',
      viewportSize: [{width: 1200, height: 600}],
      browser: [
        {name: 'chrome', width: 1000, height: 800},
        {iosDeviceInfo: {deviceName: 'iPad (7th generation)'}},
        {chromeEmulationInfo: {deviceName: 'Pixel 4 XL'}},
      ],
    });

    cy.eyesCheckWindow({layoutBreakpoints: true});
    cy.eyesCheckWindow({layoutBreakpoints: [500, 1000]});

    cy.eyesClose();
  });
});
