/* global cy */
describe('Parallel run #2', () => {
  // This also tests the override of `testName`

  it('Parallel 2', () => {
    cy.visit('https://applitools.com/helloworld');
    cy.eyesOpen({
      appName: 'Hello World!',
      testName: 'Parallel test 2, first test',
      browser: {width: 800, height: 600},
      // showLogs: true
    });
    cy.eyesCheckWindow('Main Page');
    // we wait 4 seconds to give parallel-run-1 a heads up to make sure this test can finish running successfuly even when the first one finished already.
    cy.wait(4000);
    cy.eyesClose();
  });
});
