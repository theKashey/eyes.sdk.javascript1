/* global cy */
describe('global hooks', () => {
    it('should support global hooks with flag', () => {
      cy.visit('https://applitools.com/helloworld');
      cy.eyesOpen({
        appName: 'Hello World!',
        testName: 'global hooks',
        browser: {width: 800, height: 600},
      });
      cy.eyesCheckWindow('Main Page');
      cy.eyesClose();
    });
  });
  