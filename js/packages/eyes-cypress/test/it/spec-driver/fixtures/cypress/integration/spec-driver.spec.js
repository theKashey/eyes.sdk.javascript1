/* global cy,expect */
const spec = require('../../../../../../dist/browser/spec-driver');

describe('spec: executeScript', () => {
  const getUserAgent =
    'function(arg){\nvar s=function(){"use strict";return function(){return window.navigator.userAgent}}();\nreturn s(arg)\n}';

  beforeEach(() => {
    cy.visit('https://www.applitools.com/helloworld');
  });

  it('executeScript no args', () => {
    cy.document().then(doc => {
      const userAgnet = spec.executeScript(doc, getUserAgent, {});
      expect(userAgnet).to.contain('Chrome');
    });
  });
});

describe('spec: findElement', () => {
  beforeEach(() => {
    cy.visit('https://www.applitools.com/helloworld');
  });
  it('works for findElement css selector', () => {
    cy.document().then(doc => {
      const selector = 'body > div > div.section.button-section > button';
      const button = spec.findElement(doc, {selector, type: 'css'});
      expect(button.outerText).to.equal('Click me!');
    });
  });

  it('works for findElement xpath', () => {
    cy.document().then(doc => {
      const xpath = '/html/body/div/div[3]/button';
      const button = spec.findElement(doc, {selector: xpath, type: 'xpath'});
      expect(button.outerText).to.equal('Click me!');
    });
  });

  it('works for findElements with css selector', () => {
    cy.document().then(doc => {
      const selector = 'div';
      const divs = spec.findElements(doc, {selector, type: 'css'});
      expect(divs.length).to.equal(7);
    });
  });

  it('works for findElements with xpath', () => {
    cy.document().then(doc => {
      const xpath = '//div[contains(@class, "section")]';
      const actual = spec.findElements(doc, {selector: xpath, type: 'xpath'});
      const expected = [...doc.querySelectorAll('.section')];
      expect(actual).to.eql(expected);
    });
  });
});

describe('spec: get set viewportsize', () => {
  beforeEach(() => {
    cy.visit('https://www.applitools.com/helloworld');
  });

  it('works for get and set viewport size', () => {
    const originalVS = spec.getViewportSize();
    spec.setViewportSize({size: {height: originalVS.height + 100, width: originalVS.width + 100}});
    const vsAfterResizing = spec.getViewportSize();
    expect(vsAfterResizing.height).to.be.equal(originalVS.height + 100);
    expect(vsAfterResizing.width).to.be.equal(originalVS.width + 100);
  });
});

describe('spec: getCookies', () => {
  beforeEach(() => {
    cy.visit('https://www.applitools.com/helloworld');
  });

  it('works for getCookies', () => {
    cy.document().then(async doc => {
      doc.cookie = 'value: test getCookies;';
      const returnedCookies = await spec.getCookies();
      expect(returnedCookies).to.deep.include({
        name: '',
        value: 'value: test getCookies',
        path: '/helloworld',
        domain: 'applitools.com',
        secure: false,
        httpOnly: false,
      });
    });
  });
});
