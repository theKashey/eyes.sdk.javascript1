/* global cy */
describe('Use batchId from env var', () => {
  // This also tests the override of `testName`

  it('shows how to use Applitools Eyes with Cypress', () => {
    cy.visit('https://applitools.com/helloworld');
    cy.eyesOpen({
      appName: 'Hello World!',
      testName: 'work with batchId property',
      browser: {width: 800, height: 600},
    });
    cy.eyesCheckWindow('Main Page');
    cy.eyesClose();
  });
});
