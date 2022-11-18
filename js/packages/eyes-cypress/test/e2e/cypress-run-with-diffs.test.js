'use strict';
const {describe, it, before, after} = require('mocha');
const {exec} = require('child_process');
const {promisify: p} = require('util');
const path = require('path');
const pexec = p(exec);
const fs = require('fs');

const sourceTestAppPath = path.resolve(__dirname, '../fixtures/testApp');
const targetTestAppPath = path.resolve(
  __dirname,
  '../fixtures/testAppCopies/testApp-run-wth-diffs',
);

describe('works for diffs with global hooks', () => {
  before(async () => {
    if (fs.existsSync(targetTestAppPath)) {
      fs.rmdirSync(targetTestAppPath, {recursive: true});
    }
    try {
      await pexec(`cp -r ${sourceTestAppPath}/. ${targetTestAppPath}`);
      process.chdir(targetTestAppPath);
      const packageJsonPath = path.resolve(targetTestAppPath, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath));

      packageJson.devDependencies['cypress'] = '9.7.0';
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
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

  it('works for diffs with global hooks', async () => {
    try {
      await pexec(
        './node_modules/.bin/cypress run --headless --config testFiles=helloworldDiffs.js,integrationFolder=cypress/integration-run,pluginsFile=cypress/plugins/index-run.js,supportFile=cypress/support/index-run.js',
        {
          maxBuffer: 10000000,
        },
      );
      // if we got here, it means we did not throw a diff exception and we need to fail the test
      throw new Error('Test Failed!');
    } catch (ex) {
      if (
        !ex.stdout ||
        !(ex.stdout.includes('1 of 1 failed') && ex.stdout.includes('Eyes-Cypress detected diffs'))
      ) {
        console.error('Error during test!', ex.stdout);
        throw ex;
      }
    }
  });
});
