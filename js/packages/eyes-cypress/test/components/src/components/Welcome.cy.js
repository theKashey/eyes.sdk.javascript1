import Welcome from './Welcome';

describe('Welcome', () => {
  it('should mount with greeting', () => {
    cy.mount(
      <Welcome username="Test User" onLogout={cy.spy().as('onLogout')} />
    );
    cy.contains('Welcome Test User!');
    cy.eyesOpen({
      appName: 'reactApp',
      testName: 'welcome'
    })
    cy.eyesCheckWindow('welcome')
    cy.eyesClose()
  });
});
