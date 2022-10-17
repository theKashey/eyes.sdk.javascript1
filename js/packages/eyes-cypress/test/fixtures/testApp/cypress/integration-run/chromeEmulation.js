/* global cy */
describe('chrome emulation', () => {
  // This also tests the override of `testName`

  it('Applitools Eyes with Cypress and chrome emulation', () => {
    cy.visit('https://applitools.com/helloworld');
    cy.eyesOpen({
      appName: 'Hello World!',
      testName: 'chrome emulation',
      browser: [
        {deviceName: 'Pixel 2', screenOrientation: 'portrait'},
        {chromeEmulationInfo: {deviceName: 'Nexus 10', screenOrientation: 'landscape'}},
      ],
      // showLogs: true
    });
    cy.eyesCheckWindow('Main Page');
    cy.eyesClose();
  });
});
