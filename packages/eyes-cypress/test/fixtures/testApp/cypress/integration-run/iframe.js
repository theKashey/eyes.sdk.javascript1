/* globals describe,it,cy,Cypress */
describe('eyes-cypress', () => {
  it('cypress-run-iframe', () => {
    cy.setCookie('auth', 'secret');
    const url = `http://localhost:${Cypress.config('testPort')}/test-iframe.html`;
    cy.visit(url);
    cy.eyesOpen({
      appName: 'some app',
      viewportSize: {width: 1000, height: 660}
    });
    cy.eyesCheckWindow();
    cy.eyesClose();
  });
});
