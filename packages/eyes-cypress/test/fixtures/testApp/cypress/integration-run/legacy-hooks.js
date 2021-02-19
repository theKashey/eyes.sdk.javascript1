/* global cy */
describe('legacy hooks', () => {
  it('should support legacy hooks', () => {
    cy.visit('https://applitools.com/helloworld');
    cy.eyesOpen({
      appName: 'Hello World!',
      testName: 'legacy hooks',
      browser: {width: 800, height: 600},
    });
    cy.eyesCheckWindow('Main Page');
    cy.eyesClose();
  });
});
