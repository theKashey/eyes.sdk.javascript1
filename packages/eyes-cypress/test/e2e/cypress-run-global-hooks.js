'use strict';
const {describe, it, before, after} = require('mocha');
const {exec} = require('child_process');
const {promisify: p} = require('util');
const path = require('path');
const pexec = p(exec);
const fs = require('fs');
const {presult} = require('@applitools/functional-commons');
const cypressConfig = require('../fixtures/testApp/cypress');
const {expect} = require('chai');

const sourceTestAppPath = path.resolve(__dirname, '../fixtures/testApp');
const targetTestAppPath = path.resolve(__dirname, '../fixtures/testAppCopies/testApp-globalHooks');

describe('global hooks', () => {
  before(async () => {
    if (fs.existsSync(targetTestAppPath)) {
      fs.rmdirSync(targetTestAppPath, {recursive: true});
    }
    await pexec(`cp -r ${sourceTestAppPath}/. ${targetTestAppPath}`);
    process.chdir(targetTestAppPath);
    await pexec(`npm install`, {
      maxBuffer: 1000000,
    });
  });

  after(async () => {
    fs.rmdirSync(targetTestAppPath, {recursive: true});
  });

  it('works with experimentalRunEvents flag', async () => {
    try {
      await pexec(
        './node_modules/.bin/cypress run --headless --config testFiles=global-hooks.js,integrationFolder=cypress/integration-run,pluginsFile=cypress/plugins/index-run.js,supportFile=cypress/support/index-run.js',
        {
          maxBuffer: 10000000,
        },
      );
    } catch (ex) {
      console.error('Error during test!', ex.stdout);
      throw ex;
    }
  });

  it('fails without experimentalRunEvents flag', async () => {
    try {
      const config = {...cypressConfig, experimentalRunEvents: false};
      fs.writeFileSync(`${targetTestAppPath}/cypress.json`, JSON.stringify(config, 2, null));
      const [err] = await presult(
        pexec(
          './node_modules/.bin/cypress run --headless --config testFiles=global-hooks.js,integrationFolder=cypress/integration-run,pluginsFile=cypress/plugins/index-run.js,supportFile=cypress/support/index-run.js',
          {
            maxBuffer: 10000000,
          },
        ),
      );
      expect(err.stdout).to.include(
        'Error: The `before:run` event requires the experimentalRunEvents flag to be enabled',
      );
    } catch (ex) {
      console.error('Error during test!', ex.stdout);
      throw ex;
    }
  });
});
