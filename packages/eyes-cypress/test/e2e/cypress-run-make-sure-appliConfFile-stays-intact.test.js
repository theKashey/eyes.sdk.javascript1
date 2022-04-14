'use strict';
const {describe, it, before, after} = require('mocha');
const {expect} = require('chai');
const {exec} = require('child_process');
const {promisify: p} = require('util');
const path = require('path');
const pexec = p(exec);
const fs = require('fs');
const {presult} = require('@applitools/functional-commons');
const applitoolsConfig = require('../fixtures/testApp/applitools.config.js');

const sourceTestAppPath = path.resolve(__dirname, '../fixtures/testApp');
const targetTestAppPath = path.resolve(
  __dirname,
  '../fixtures/testAppCopies/testApp-make-sure-appliConfFile-stays-intact',
);

async function runCypress(pluginsFile, testFile = 'appliConfFile.js') {
  return (
    await pexec(
      `./node_modules/.bin/cypress run --headless --config testFiles=${testFile},integrationFolder=cypress/integration-run,pluginsFile=cypress/plugins/${pluginsFile},supportFile=cypress/support/index-run.js`,
      {
        maxBuffer: 10000000,
      },
    )
  ).stdout;
}

// function parseTestResults(){

// }

describe('make sure appliConfFile stays intact', () => {
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

  it('appliConfFile, browserInfo stays intact', async () => {
    const config = {
      browser: [{width: 650, height: 800, name: 'firefox'}],
      failCypressOnDiff: false,
    };
    fs.writeFileSync(
      `${targetTestAppPath}/applitools.config.js`,
      'module.exports =' + JSON.stringify(config, 2, null),
    );
    const [err, v] = await presult(runCypress('get-test-results.js', 'appliConfFile.js'));
    expect(err).to.be.undefined;
    // console.log(v);
    expect(v).to.contain(
      `first test - config file - browsers: {\"width\":650,\"height\":800,\"name\":\"firefox\"}`,
    );
    expect(v).to.contain(
      `second test - config file - browsers: {\"width\":650,\"height\":800,\"name\":\"firefox\"}`,
    );
  });
});
