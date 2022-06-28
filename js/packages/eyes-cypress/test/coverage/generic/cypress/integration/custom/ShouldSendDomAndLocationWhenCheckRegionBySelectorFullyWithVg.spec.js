/* global cy,Cypress*/
const assert = require('assert');
const {getTestInfo} = require('@applitools/test-utils');

describe('Coverage tests', () => {
  it('should send dom and location when check region by selector fully with vg', () => {
    cy.visit('https://applitools.github.io/demo/TestPages/FramesTestPage/');
    cy.eyesOpen({
      appName: 'Applitools Eyes SDK',
      testName: 'ShouldSendDomAndLocationWhenCheckRegionBySelectorFullyWithVg',
      viewportSize: {width: 700, height: 460},
      branchName: 'CypressUniversal',
    });

    cy.window().then(win => {
      const func = new win.Function(`window.scrollTo(0, 350)`);
      return func(...[]);
    });

    cy.eyesCheckWindow({
      target: 'region',
      selector: {selector: '#overflowing-div'},
      fully: true,
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
