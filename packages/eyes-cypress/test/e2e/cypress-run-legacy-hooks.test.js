'use strict';
const {describe, it, before, after} = require('mocha');
const {exec} = require('child_process');
const {promisify: p} = require('util');
const path = require('path');
const pexec = p(exec);
const fs = require('fs');

const sourceTestAppPath = path.resolve(__dirname, '../fixtures/testApp');
const legacyHooksCustomConfigPath = path.resolve(__dirname, '../fixtures/legacyHooks');
const targetTestAppPath = path.resolve(__dirname, '../fixtures/testAppCopies/testApp-legacyHooks');

describe('legacy hooks', () => {
  before(async () => {
    if (fs.existsSync(targetTestAppPath)) {
      fs.rmdirSync(targetTestAppPath, {recursive: true});
    }
    await pexec(`cp -r ${sourceTestAppPath}/. ${targetTestAppPath}`);
    process.chdir(targetTestAppPath);
    await pexec(`npm install && npm install cypress@6.0.0 --save`, {
      maxBuffer: 1000000,
    });
  });

  after(async () => {
    fs.rmdirSync(targetTestAppPath, {recursive: true});
  });

  it('works with older versions without legacyHooks flag', async () => {
    try {
      await pexec(
        './node_modules/.bin/cypress run --headless --config testFiles=legacy-hooks.js,integrationFolder=cypress/integration-run,pluginsFile=cypress/plugins/index-run.js,supportFile=cypress/support/index-run.js',
        {
          maxBuffer: 10000000,
        },
      );
    } catch (ex) {
      console.error('Error during test!', ex.stdout);
      throw ex;
    }
  });

  it('works with newer versions with legacyHooks flag', async () => {
    try {
      await pexec(`cp -r ${legacyHooksCustomConfigPath}/. ${targetTestAppPath}`);
      await pexec(`npm install cypress@6.3.0 --save`, {
        maxBuffer: 1000000,
      });
      await pexec(
        './node_modules/.bin/cypress run --headless --config testFiles=legacy-hooks.js,integrationFolder=cypress/integration-run,pluginsFile=cypress/plugins/index-run.js,supportFile=cypress/support/index-run.js',
        {
          maxBuffer: 10000000,
        },
      );
    } catch (ex) {
      console.error('Error during test!', ex.stdout);
      throw ex;
    }
  });
});
