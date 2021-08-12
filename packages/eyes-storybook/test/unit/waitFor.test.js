'use strict';
const {describe, it} = require('mocha');
const waitFor = require('../../src/waitFor');
const {expect} = require('chai');

describe('waitFor', () => {
  let number, func, selector, xpath;
  const page = {
    waitForTimeout: async n => {
      number = n;
    },
    waitForSelector: async s => {
      selector = s;
    },
    waitForXPath: async x => {
      xpath = x;
    },
    waitForFunction: async execFunc => {
      func = execFunc;
    },
  };

  it('should work with number', async () => {
    await waitFor(page, 3000);
    expect(number).to.equal(3000);
  });
  it('should work with function', async () => {
    const waitForFunc = () => 'do some stuff';
    await waitFor(page, waitForFunc);
    expect(func).to.equal(waitForFunc);
  });
  it('should work with selector', async () => {
    await waitFor(page, '.selector');
    expect(selector).to.equal('.selector');
  });
  it('should work with xpath', async () => {
    await waitFor(page, '//div');
    expect(xpath).to.equal('//div');
  });
});
