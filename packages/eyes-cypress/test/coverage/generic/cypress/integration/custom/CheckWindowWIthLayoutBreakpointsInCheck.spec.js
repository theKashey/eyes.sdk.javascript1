describe('Coverage tests', () => {
  /* global cy*/
  it('check window with layout breakpoints in config', () => {
    cy.visit('https://applitools.github.io/demo/TestPages/JsLayout');
    cy.eyesOpen({
      appName: 'Applitools Eyes SDK',
      testName: 'CheckWindowWithLayoutBreakpointsInConfig',
      displayName: 'check window with layout breakpoints in config',
      browser: [
        {name: 'chrome', width: 1000, height: 800},
        {iosDeviceInfo: {deviceName: 'iPad (7th generation)'}},
        {chromeEmulationInfo: {deviceName: 'Pixel 4 XL'}},
      ],
    });
    cy.eyesCheckWindow({isFully: false, fully: false, layoutBreakpoints: [500, 1000]});
    cy.eyesClose(undefined);
  });
});
