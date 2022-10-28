import InputField from './InputField';

describe('InputField', () => {
  it('should mount with label', () => {
    cy.mount(
      <InputField
        name="name"
        label="Name"
        requiredMessage="Name is required"
        submitted={false}
      />
    );
    cy.get('label').contains('Name');
    cy.eyesOpen({
      appName: 'reactApp',
      testName: 'input field'
    })
    cy.eyesCheckWindow('input field')
    cy.eyesClose()
  });
});
