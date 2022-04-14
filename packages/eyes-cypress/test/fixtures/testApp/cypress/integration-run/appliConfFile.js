/* global cy */
describe('Hello world', () => {
  // This also tests the override of `testName`

  it('make sure config file stays intact first test', () => {
    cy.visit('https://applitools.com/helloworld');
    cy.eyesOpen({
      appName: 'Hello World!',
      testName: 'first test - config file',
    });
    cy.eyesCheckWindow('Main Page');
    cy.eyesClose();
  });

  it('make sure config file stays intact second test', () => {
    cy.eyesOpen({
      appName: 'Hello World!',
      testName: 'second test - config file',
    });
    cy.eyesCheckWindow('Main Page');
    cy.eyesClose();
  });

  after(() => {
    cy.eyesGetAllTestResults().then(summary => {
      let res = '';
      for (const result of summary.getAllResults()) {
        res +=
          result.getTestResults()._results.name +
          ' - browsers: ' +
          JSON.stringify(result._container.browserInfo) +
          '\n';
      }

      cy.task('log', res);
    });
  });
});
