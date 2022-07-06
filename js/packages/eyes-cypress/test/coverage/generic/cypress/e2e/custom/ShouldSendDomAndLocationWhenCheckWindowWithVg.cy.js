/* global cy,Cypress*/
const assert = require('assert');
const {getTestInfo} = require('@applitools/test-utils');

describe('Coverage tests', () => {
  it('should send dom and location when check window with vg', () => {
    cy.visit('https://applitools.github.io/demo/TestPages/FramesTestPage/');
    cy.eyesOpen({
      appName: 'Applitools Eyes SDK',
      testName: 'ShouldSendDomAndLocationWhenCheckWindowWithVg',
      viewportSize: {width: 700, height: 460},
    });

    cy.window().then(win => {
      const func = new win.Function('window.scrollBy(0, 350)');
      return func(...[]);
    });

    cy.window().then(win => {
      const func = new win.Function(
        `document.documentElement.setAttribute("data-expected-target", "true");`,
      );
      return func(...[]);
    });
    cy.eyesCheckWindow({
      scriptHooks: {beforeCaptureScreenshot: 'window.scrollTo(0, 350)'},
      fully: false,
    });
    cy.eyesClose();
    cy.eyesGetAllTestResults().then(async summary => {
      const info = await getTestInfo(
        summary.getAllResults()[0].getTestResults(),
        Cypress.config('appliConfFile').apiKey,
      );
      assert.deepStrictEqual(info['actualAppOutput']['0']['image']['hasDom'], true, undefined);
    });
  });
});
