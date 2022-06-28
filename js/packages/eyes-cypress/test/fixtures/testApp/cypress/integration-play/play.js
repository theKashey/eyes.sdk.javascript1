/* global describe, it, cy, Cypress */
Cypress.on('uncaught:exception', () => {});

describe('Play Cypress', () => {
  it.only('Play Cypress', () => {
    
    cy.eyesOpen({
      appName: 'Play Cypress',
      testName: 'Check Window',
     // browser: [{width: 1200, height: 900}]
    });
    cy.visit('https://example.org', {
      failOnStatusCode: false,
    });
    cy.eyesCheckWindow({
      tag: 'Play Cypress',
    });
    cy.eyesClose();
    // cy.eyesGetAllTestResults().then(async (summary) => {
    //   // delete all tests
    //   // const promise = Promise.resolve()
    //   // for (const container of summary.results) {
    //   //   promise = promise.then(() => container.testResults.delete())
    //   // }
    //   console.log(JSON.stringify(summary))
    //   for(const result of summary.getAllResults()) {
    //   await summary.getAllResults()[0].getTestResults().delete()
    //   }
    // })
  });
  it.only('Play Cypress checkRegion', () => {
    cy.visit('https://example.org', {
      failOnStatusCode: false,
    });
    cy.eyesOpen({
      appName: 'Play Cypress',
      testName: 'Check Region'
    });
    cy.eyesCheckWindow({
      target: 'region',
      selector: {
        type: 'css',
        selector: 'body > div > h1' 
      }
    });
    cy.eyesClose();
    cy.eyesGetAllTestResults().then(async (summary) => {
      // delete all tests
      // const promise = Promise.resolve()
      // for (const container of summary.results) {
      //   promise = promise.then(() => container.testResults.delete())
      // }
      console.log(JSON.stringify(summary))
      for(const result of summary.getAllResults()) {
        await result.getTestResults().delete()
      }
    })
  });
  it('test region in shadow DOM', () => {
    cy.visit('https://applitools.github.io/demo/TestPages/ShadowDOM/index.html');
    cy.eyesOpen({
      appName: 'som app',
      testName: 'region in shadow dom',
      browser: {width: 800, height: 600},
    });

    cy.eyesCheckWindow({
      target: 'region',
      selector: [{
        type: 'css',
        selector: '#has-shadow-root',
        nodeType: 'shadow-root'
      },{
          type: 'css',
          selector: 'h1',
          nodeType: 'element'
          
      }]
  });
    cy.eyesCheckWindow({
      target: 'region',
      selector: [{
        type: 'css',
        selector: '#has-shadow-root',
        nodeType: 'shadow-root'
      },{
          type: 'css',
          selector: '#has-shadow-root-nested > div',
          nodeType: 'shadow-root'
          
      },{
          type: 'css',
          selector: 'div',
          nodeType: 'element'

      }]
  });
    cy.eyesClose();
  });

  it('shows how to use Applitools Eyes with Cypress', () => {
    cy.visit('https://applitools.com/helloworld');
    cy.eyesOpen({
      appName: 'Hello World!',
      testName: 'My first JavaScript test!',
      browser: {width: 800, height: 600},
      // showLogs: true
    });
    cy.eyesCheckWindow('Main Page');
    cy.get('button').click();
    cy.eyesCheckWindow('Click!');
    cy.eyesClose();
  });  

  it('tutorial-cypress', () => {
    cy.visit('https://demo.applitools.com');
    cy.eyesOpen({
      appName: 'Hello World!',
      testName: 'My first JavaScript test!',
      browser: {width: 800, height: 600},
      // showLogs: true
    });
    cy.eyesCheckWindow({
      tag: "Login Window",
      target: 'window',
      fully: true
    });
    cy.get('#log-in').click()
    cy.eyesCheckWindow({
      tag: "App Window",
      target: 'window',
      fully: true
  });
    cy.eyesClose();
  });  
});
