/* global cy */
describe('testResultsSummary', () => {
  it('First test', () => {
    cy.eyesOpen({
      appName: 'test result summary',
      testName: 'This is the first test',
    });
    cy.visit('https://example.org', {
      failOnStatusCode: false,
    });
    cy.eyesCheckWindow({
      tag: 'Play Cypress',
    });
    cy.eyesClose();
  });

  it('Second test', () => {
    cy.visit('https://example.org');
    cy.eyesOpen({
      appName: 'test result summary',
      testName: 'This is the second test',
    });
    cy.eyesCheckWindow({
      target: 'region',
      selector: {
        type: 'css',
        selector: 'body > div > h1',
      },
    });
    cy.eyesClose();
  });

  after(() => {
    cy.eyesGetAllTestResults().then(summary => {
      cy.task('log', `Summary results: ${JSON.stringify(summary)}`);
    });
  });
});
