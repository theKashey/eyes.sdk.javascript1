/* global cy */
describe('Region in shadow DOM', () => {
  // This also tests the override of `testName`

  it('test region in nested shadow DOM', () => {
    cy.visit('https://applitools.github.io/demo/TestPages/ShadowDOM/index.html');
    cy.eyesOpen({
      appName: 'some app',
      testName: 'region in nested shadow dom',
      browser: {width: 800, height: 600},
    });
    cy.eyesCheckWindow({
      target: 'region',
      selector: [
        {
          type: 'css',
          selector: '#has-shadow-root',
          nodeType: 'shadow-root',
        },
        {
          type: 'css',
          selector: '#has-shadow-root-nested > div',
          nodeType: 'shadow-root',
        },
        {
          type: 'css',
          selector: 'div',
          nodeType: 'element',
        },
      ],
    });
    cy.eyesClose();
  });

it('test region in shadow DOM', () => {
  cy.visit('https://applitools.github.io/demo/TestPages/ShadowDOM/index.html');
  cy.eyesOpen({
    appName: 'some app',
    testName: 'region in shadow dom',
    browser: {width: 800, height: 600},
  });
  cy.eyesCheckWindow({
    target: 'region',
    selector: [
      {
        type: 'css',
        selector: '#has-shadow-root',
        nodeType: 'shadow-root',
      },
      {
        type: 'css',
        selector: 'h1',
        nodeType: 'element',
      },
    ],
  });
  cy.eyesClose();
});
});
