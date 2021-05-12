'use strict';
const {describe, it} = require('mocha');
const {expect} = require('chai');
const shouldSetGlobalHooks = require('../../../src/plugin/shouldSetGlobalHooks');

describe('shouldSetGlobalHooks', () => {
  it('should return true if version >= 6.2.0 and experimentalRunEvents flag is set', () => {
    expect(shouldSetGlobalHooks({version: '6.2.0', experimentalRunEvents: true})).to.be.true;
  });

  it('should return false if no experimentalRunEvents flag is set', () => {
    expect(shouldSetGlobalHooks({version: '6.2.0'})).to.be.false;
  });

  it('should return true if version >= 6.7.0', () => {
    expect(shouldSetGlobalHooks({version: '6.7.0'})).to.be.true;
  });

});
