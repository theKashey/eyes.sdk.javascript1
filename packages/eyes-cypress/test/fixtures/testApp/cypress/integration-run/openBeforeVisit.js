/* global cy */
describe('eyes-cypress', () => {
  // This also tests the setting of `testName` inside `it`

  it('works for open before visit', () => {
    cy.setCookie('auth', 'secret');
    const url = `http://localhost:${Cypress.config('testPort')}/test.html`;
    cy.eyesOpen({
      appName: 'some app',
      testName: 'open before visit',
      browser: [
        {width: 800, height: 600, name: 'chrome'},
        {width: 700, height: 500, name: 'firefox'},
        {width: 1600, height: 1200, name: 'chrome'},
        {width: 1024, height: 768, name: 'edgechromium'},
        {width: 800, height: 600, name: 'safari'},
      ],
    });
    cy.visit(url);
    cy.eyesCheckWindow('full page');
    cy.eyesClose();
  });
});
