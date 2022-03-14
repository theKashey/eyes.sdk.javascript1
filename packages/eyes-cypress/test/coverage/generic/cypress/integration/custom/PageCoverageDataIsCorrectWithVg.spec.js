/* global cy,Cypress*/

const assert = require('assert');
const {getTestInfo} = require('@applitools/test-utils');

describe('Coverage tests', () => {
  it('pageCoverage data is correct with vg', () => {
    cy.visit('https://applitools.github.io/demo/TestPages/SimpleTestPage/index.html');
    cy.eyesOpen({
      appName: 'Applitools Eyes SDK',
      testName: 'PageCoverageDataIsCorrectWithVg',
      viewportSize: {width: 700, height: 460},
      baselineEnvName: 'PageCoverageDataIsCorrectWithVg',
      displayName: 'pageCoverage data is correct with vg',
      branchName: 'CypressUniversal',
      failCypressOnDiff: false,
    });
    cy.eyesCheckWindow({
      pageId: 'my-page',
      fully: true,
    });
    cy.eyesCheckWindow({
      target: 'region',
      selector: {selector: '#overflowing-div > img:nth-child(22)'},
      pageId: 'my-page',
      fully: true,
    });
    cy.eyesCheckWindow({
      target: 'region',
      region: {x: 10, y: 15, width: 200, height: 150},
      pageId: 'my-page1',
      fully: true,
    });

    cy.eyesClose();
    cy.eyesGetAllTestResults().then(async summary => {
      const info = await getTestInfo(
        summary.getAllResults()[0].getTestResults(),
        Cypress.config('appliConfFile').apiKey,
      );
      assert.deepStrictEqual(
        info['actualAppOutput']['0']['pageCoverageInfo']['pageId'],
        'my-page',
        'pageId match',
      );
      assert.deepStrictEqual(
        info['actualAppOutput']['0']['pageCoverageInfo']['width'],
        958,
        'Page width match',
      );
      assert.deepStrictEqual(
        info['actualAppOutput']['0']['pageCoverageInfo']['height'],
        3540,
        'Page height match',
      );
      assert.deepStrictEqual(
        info['actualAppOutput']['0']['pageCoverageInfo']['imagePositionInPage'],
        {x: 0, y: 0},
        'Full page',
      );
      assert.deepStrictEqual(
        info['actualAppOutput']['1']['pageCoverageInfo']['imagePositionInPage'],
        {x: 641, y: 1297},
        'Selector match',
      );
      assert.deepStrictEqual(
        info['actualAppOutput']['2']['pageCoverageInfo']['imagePositionInPage'],
        {x: 10, y: 15},
        'Region match',
      );
    });
  });
});
