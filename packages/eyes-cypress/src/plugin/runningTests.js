'use strict';

const runningTests = {
  tests: [],
  add(test) {
    this.tests.push(test);
  },
  reset() {
    this.tests = [];
  },
};

module.exports = runningTests;
