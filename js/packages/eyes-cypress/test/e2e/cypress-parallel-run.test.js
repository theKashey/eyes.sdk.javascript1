'use strict';
const {describe, it, before, after} = require('mocha');
const {exec} = require('child_process');
const {promisify: p} = require('util');
const path = require('path');
const pexec = p(exec);
const fs = require('fs');

const sourceTestAppPath = path.resolve(__dirname, '../fixtures/testApp');
const targetTestAppPath = path.resolve(__dirname, '../fixtures/testAppCopies/testApp-parallel-run');

describe('parallel run', () => {
  before(async () => {
    if (fs.existsSync(targetTestAppPath)) {
      fs.rmdirSync(targetTestAppPath, {recursive: true});
    }
    try {
      await pexec(`cp -r ${sourceTestAppPath}/. ${targetTestAppPath}`);
      process.chdir(targetTestAppPath);
      await pexec(`npm install`, {
        maxBuffer: 1000000,
      });
    } catch (ex) {
      console.log(ex);
      throw ex;
    }
  });

  after(async () => {
    fs.rmdirSync(targetTestAppPath, {recursive: true});
  });

  it('works for parallel cypress runs', async () => {
    try {
      const runs = [];
      runs.push(
        pexec(
          './node_modules/.bin/cypress run --headless --config testFiles=parallel-run-1.js,integrationFolder=cypress/integration-run,pluginsFile=cypress/plugins/index-run.js,supportFile=cypress/support/index-run.js',
          {
            maxBuffer: 10000000,
            timeout: 60000,
          },
        ),
      );
      runs.push(
        pexec(
          './node_modules/.bin/cypress run --headless --config testFiles=parallel-run-2.js,integrationFolder=cypress/integration-run,pluginsFile=cypress/plugins/index-run.js,supportFile=cypress/support/index-run.js',
          {
            maxBuffer: 10000000,
            timeout: 60000,
          },
        ),
      );
      await Promise.all(runs);
    } catch (ex) {
      console.error('Error during test!', ex.stdout);
      throw ex;
    }
  });
});
