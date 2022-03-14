/* global cy */
describe('eyes-cypress', () => {
  // This also tests the setting of `testName` inside `it`

  it('failed test', () => {
    const url = `http://localhost:${Cypress.config('testPort')}/fail.html`;
    cy.visit(url);
    cy.eyesOpen({
      appName: 'failing app',
    });
    cy.eyesCheckWindow();
    cy.eyesClose();
  });
});
