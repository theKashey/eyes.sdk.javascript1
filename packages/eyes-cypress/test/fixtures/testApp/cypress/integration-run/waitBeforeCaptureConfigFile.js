describe('works with waitBeforeCapture', () => {
  it('test waitBeforeCapture in config file', () => {
    cy.viewport(600, 600);
    cy.visit('https://applitools.github.io/demo/TestPages/waitBeforeCapture/');
    cy.eyesOpen({
      appName: 'some app',
      testName: 'test waitBeforeCapture, config file',
      browser: {width: 1200, height: 800},
      layoutBreakPoints: true,
    });

    cy.eyesCheckWindow({
      target: 'window',
    });

    cy.eyesClose();
  });
});
