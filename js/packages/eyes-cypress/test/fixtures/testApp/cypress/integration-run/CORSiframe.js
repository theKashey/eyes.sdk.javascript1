/* global cy */
describe('CORS iframe', () => {
  it('should not show any content in CORS iframe', () => {
    cy.visit('https://applitools.github.io/demo/TestPages/CorsTestPage/');
    cy.eyesOpen({
      appName: 'CorsTestPage',
      testName: 'CORS  iframe page',
      browser: {width: 800, height: 600},
    });
    cy.eyesCheckWindow('Main Page');
    cy.eyesClose();
  });
});
