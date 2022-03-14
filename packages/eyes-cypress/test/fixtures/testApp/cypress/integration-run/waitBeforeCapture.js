/* global cy */
describe('works with waitBeforeCapture', () => {
  it('test waitBeforeCapture in open', () => {
    cy.viewport(600, 600);
    cy.visit('https://applitools.github.io/demo/TestPages/waitBeforeCapture/');
    cy.eyesOpen({
      appName: 'some app',
      testName: 'test waitBeforeCapture, eyesOpen',
      browser: {width: 1200, height: 800},
      layoutBreakPoints: true,
      waitBeforeCapture: 2000,
    });

    cy.eyesCheckWindow({
      target: 'window',
    });

    cy.eyesClose();
  });

  it('test waitBeforeCapture in check', () => {
    cy.viewport(600, 600);
    cy.visit('https://applitools.github.io/demo/TestPages/waitBeforeCapture/');
    cy.eyesOpen({
      appName: 'some app',
      testName: 'test waitBeforeCapture, eyesCheck',
      browser: {width: 1200, height: 800},
    });

    cy.eyesCheckWindow({
      target: 'window',
      layoutBreakPoints: true,
      waitBeforeCapture: 2000,
    });

    cy.eyesClose();
  });
});
