'use strict';

const runningTests = {
  tests: [],
  add(test) {
    this.tests.push(test);
  },
  reset() {
    this.tests = [];
  },
  async abortTests() {
    return Promise.all(
      this.tests.map(async test => {
        if (test.closePromise) {
          // this condition doesn't really happen in the code, but it's here for purity. This is used in handlers' batchStart in order to cleanup the state in case a zombie open was called.
          await test.closePromise;
        } else {
          await test.abort();
        }
      }),
    );
  },
};

module.exports = runningTests;
