'use strict';

const {describe, it} = require('mocha');
const {expect} = require('chai');
const getErrorsAndDiffs = require('../../../src/plugin/getErrorsAndDiffs');

describe('getErrorAndDiffs', () => {
  it('works', () => {
    const passed1 = {
      name: 'test1',
      hostDisplaySize: {width: 1, height: 2},
      url: 'url1',
      status: 'Passed',
    };
    const passed2 = {
      name: 'test2',
      hostDisplaySize: {width: 3, height: 4},
      url: 'url2',
      status: 'Passed',
    };
    const failed1 = {
      name: 'test3',
      hostDisplaySize: {width: 5, height: 6},
      url: 'url3',
      status: 'Failed',
    };
    const failed2 = {
      name: 'test4',
      hostDisplaySize: {width: 7, height: 8},
      url: 'url4',
      status: 'Failed',
    };
    const unresolved = {
      name: 'test5',
      hostDisplaySize: {width: 9, height: 10},
      url: 'url5',
      status: 'Unresolved',
    };
    const unresolvedNew = {
      name: 'test6',
      hostDisplaySize: {width: 11, height: 12},
      url: 'url6',
      status: 'Unresolved',
      isNew: true,
    };
    const err1 = {
      name: 'test2',
      hostDisplaySize: {width: 13, height: 14},
      url: 'url2',
      status: 'Passed',
    };
    err1.error = new Error('bla');
    const err2 = {
      name: 'test2',
      hostDisplaySize: {width: 15, height: 16},
      url: 'url2',
      status: 'Passed',
    };
    err2.error = new Error('bloo');
    const err3 = new Error('kuku');
    const testResultsArr = [
      passed1,
      passed2,
      failed1,
      failed2,
      unresolved,
      unresolvedNew,
      err1,
      err2,
      err3,
    ];
    const {failed, diffs, passed} = getErrorsAndDiffs(testResultsArr);
    expect(failed).to.eql([failed1, failed2, unresolvedNew, err1, err2, err3]);
    expect(diffs).to.eql([unresolved]);
    expect(passed).to.eql([passed1, passed2]);
  });
});
