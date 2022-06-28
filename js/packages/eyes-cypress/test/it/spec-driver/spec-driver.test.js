'use strict';
const {describe, it, before} = require('mocha');
const cypress = require('cypress');
const path = require('path');
const {exec} = require('child_process');
const {promisify: p} = require('util');
const pexec = p(exec);

describe('spec-driver', () => {
  before(async () => {
    try {
      process.chdir(path.resolve(__dirname, '../spec-driver/fixtures'));
      await pexec(`npm install`, {
        maxBuffer: 1000000,
      });
    } catch (ex) {
      console.log(ex);
    }
  });

  it('works for spec-driver.spec.js', async () => {
    await runCypress('spec-driver').then(results => {
      const tests = results.runs[0].tests;
      for (const res of tests) {
        if (res.state != 'passed') {
          throw `${res.title[0]} finished with status ${res.state}`;
        }
      }
    });
  });

  it.skip('playground', async () => {
    await openCypress();
  });
});

function runCypress(spec) {
  return cypress.run({
    browser: 'chrome',
    headless: true,
    spec: `cypress/integration/${spec}.spec.js`,
  });
}

function openCypress() {
  return cypress.open({
    browser: 'chrome',
  });
}
