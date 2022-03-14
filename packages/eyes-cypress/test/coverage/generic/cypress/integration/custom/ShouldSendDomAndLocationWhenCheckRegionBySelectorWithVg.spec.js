/* global cy,Cypress*/
const assert = require('assert');
const {getTestInfo} = require('@applitools/test-utils');

describe('Coverage tests', () => {
  it('should send dom and location when check region by selector with vg', () => {
    cy.visit('https://applitools.github.io/demo/TestPages/FramesTestPage/');
    cy.eyesOpen({
      appName: 'Applitools Eyes SDK',
      testName: 'ShouldSendDomAndLocationWhenCheckRegionBySelectorWithVg',
      viewportSize: {width: 700, height: 460},
      branchName: 'CypressUniversal',
    });

    cy.get('#centered').then(el => {
      cy.window().then(win => {
        const func = new win.Function(`function func(args) {
                     args[0].setAttribute("data-expected-target", "true");
                    }`);
        func(...[el]);
      });
    });

    cy.eyesCheckWindow({
      target: 'region',
      selector: {selector: '#centered'},
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
