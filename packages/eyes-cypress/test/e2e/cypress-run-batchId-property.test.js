'use strict';
const {describe, it, before, after} = require('mocha');
const {exec} = require('child_process');
const {promisify: p} = require('util');
const path = require('path');
const pexec = p(exec);
const {testServerInProcess} = require('@applitools/test-server');
const fs = require('fs');
const applitoolsConfig = require('../fixtures/testApp/applitools.config.js');

const sourceTestAppPath = path.resolve(__dirname, '../fixtures/testApp');
const targetTestAppPath = path.resolve(
  __dirname,
  '../fixtures/testAppCopies/testApp-batchId-property',
);

describe('handle batchId property', () => {
  let closeServer;
  before(async () => {
    const staticPath = path.resolve(__dirname, '../fixtures');
    const server = await testServerInProcess({
      port: 5555,
      staticPath,
    });
    closeServer = server.close;
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
    await closeServer();
  });

  it('works with batchId from env var with global hooks', async () => {
    await pexec(`npm install cypress@latest`);
    process.env.APPLITOOLS_BATCH_ID = 'batchId1234';
    try {
      await pexec(
        './node_modules/.bin/cypress run --headless --config testFiles=batchIdProperty.js,integrationFolder=cypress/integration-run,pluginsFile=cypress/plugins/index-run.js,supportFile=cypress/support/index-run.js',
        {
          maxBuffer: 10000000,
        },
      );
    } catch (ex) {
      console.error('Error during test!', ex.stdout);
      throw ex;
    } finally {
      delete process.env.APPLITOOLS_BATCH_ID;
    }
  });
  it('works with batchId from config file with global hooks', async () => {
    await pexec(`npm install cypress@latest`);
    const config = {...applitoolsConfig, batchId: 'batchId123456'};
    fs.writeFileSync(
      `${targetTestAppPath}/applitools.config.js`,
      'module.exports =' + JSON.stringify(config, 2, null),
    );
    try {
      await pexec(
        './node_modules/.bin/cypress run --headless --config testFiles=batchIdProperty.js,integrationFolder=cypress/integration-run,pluginsFile=cypress/plugins/index-run.js,supportFile=cypress/support/index-run.js',
        {
          maxBuffer: 10000000,
        },
      );
    } catch (ex) {
      console.error('Error during test!', ex.stdout);
      throw ex;
    } finally {
      delete process.env.APPLITOOLS_BATCH_ID;
    }
  });
});
