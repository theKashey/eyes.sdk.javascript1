/* global cy,Cypress*/
const {getTestInfo} = require('@applitools/test-utils');
const assert = require('assert');

describe('Coverage tests', () => {
  it('variant id with vg', () => {
    cy.visit('https://applitools.github.io/demo/TestPages/FramesTestPage/');
    cy.eyesOpen({
      appName: 'Applitools Eyes SDK',
      testName: 'VariantIdWithVg',
      viewportSize: {width: 700, height: 460},
      branchName: 'CypressUniversal',
    });

    cy.eyesCheckWindow({
      variationGroupId: 'variant-id',
      fully: false,
    });
    cy.eyesClose();
    cy.eyesGetAllTestResults().then(async summary => {
      const info = await getTestInfo(
        summary.getAllResults()[0].getTestResults(),
        Cypress.config('appliConfFile').apiKey,
      );
      assert.deepStrictEqual(
        info['actualAppOutput']['0']['knownVariantId'],
        'variant-id',
        undefined,
      );
    });
  });
});
