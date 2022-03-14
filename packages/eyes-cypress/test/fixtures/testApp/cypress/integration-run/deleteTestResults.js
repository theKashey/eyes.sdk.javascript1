/* global cy */
describe('delete test results with testResultsSummary', () => {
  it('delete test results', () => {
    cy.eyesOpen({
      appName: 'test result summary',
      testName: 'delete result',
    });
    cy.visit('https://example.org', {
      failOnStatusCode: false,
    });
    cy.eyesCheckWindow({
      tag: 'check',
    });
    cy.eyesClose();
  });

  after(() => {
    cy.eyesGetAllTestResults().then(async summary => {
      for (const result of summary.getAllResults()) {
        await result.getTestResults().delete();
      }
    });
  });
});
