/* global cy */
describe('Hello world with diff', () => {
  // This also tests the override of `testName`

  it('shows how to use Applitools Eyes with Cypress', () => {
    cy.visit('https://applitools.com/helloworld/?diff1');
    cy.eyesOpen({
      appName: 'Hello World!',
      testName: 'With diffs',
      browser: {width: 800, height: 600},
    });
    cy.eyesCheckWindow('Main Page');
    cy.eyesClose();
  });
});
