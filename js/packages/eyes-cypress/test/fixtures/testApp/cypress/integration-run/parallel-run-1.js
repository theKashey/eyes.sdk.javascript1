/* global cy */
describe('Parallel run #1', () => {
  // This also tests the override of `testName`

  it('Parallel 1', () => {
    cy.visit('https://applitools.com/helloworld');
    cy.eyesOpen({
      appName: 'Hello World!',
      testName: 'parallel test 1',
      browser: {width: 800, height: 600},
    });
    cy.eyesClose();
  });
});
