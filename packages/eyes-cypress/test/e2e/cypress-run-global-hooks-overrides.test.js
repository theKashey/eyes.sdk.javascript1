'use strict';
const {describe, it, before, after} = require('mocha');
const {expect} = require('chai');
const {exec} = require('child_process');
const {promisify: p} = require('util');
const path = require('path');
const pexec = p(exec);
const fs = require('fs');
const {presult} = require('@applitools/functional-commons');

const sourceTestAppPath = path.resolve(__dirname, '../fixtures/testApp');
const targetTestAppPath = path.resolve(
  __dirname,
  '../fixtures/testAppCopies/testApp-global-hooks-overrides',
);
const cwd = process.cwd();

async function runCypress(pluginsFile, testFile = 'global-hooks-overrides.js') {
  return (
    await pexec(
      `./node_modules/.bin/cypress run --headless --config testFiles=${testFile},integrationFolder=cypress/integration-run,pluginsFile=cypress/plugins/${pluginsFile},supportFile=cypress/support/index-run.js`,
      {
        maxBuffer: 10000000,
      },
    )
  ).stdout;
}

describe('global hooks override', () => {
  before(async () => {
    if (fs.existsSync(targetTestAppPath)) {
      fs.rmdirSync(targetTestAppPath, {recursive: true});
    }
    await pexec(`cp -r ${sourceTestAppPath}/. ${targetTestAppPath}`);
    const packageJsonPath = path.resolve(targetTestAppPath, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath));
    process.chdir(cwd);
    const latestCypressVersion = (await pexec('npm view cypress version')).stdout.trim();
    packageJson.devDependencies['cypress'] = latestCypressVersion;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    process.chdir(targetTestAppPath);
    await pexec(`npm install`, {
      maxBuffer: 1000000,
    });
  });

  after(async () => {
    fs.rmdirSync(targetTestAppPath, {recursive: true});
  });

  it('supports running *sync* user defined global hooks', async () => {
    const [err, output] = await presult(runCypress('index-global-hooks-overrides-sync.js'));
    expect(err).to.be.undefined;
    expect(output).to.contain('@@@ before:run @@@');
    expect(output).to.contain('@@@ after:run @@@');
  });

  it('supports running *async* user defined global hooks', async () => {
    const [err, output] = await presult(runCypress('index-global-hooks-overrides-async.js'));
    expect(err).to.be.undefined;
    expect(output).to.contain('@@@ before:run @@@');
    expect(output).to.contain('@@@ after:run @@@');
  });

  it('supports running user defined global hooks, when user throws error on before', async () => {
    const [err] = await presult(runCypress('index-global-hooks-overrides-error-before.js'));
    expect(err).not.to.be.undefined;
    expect(err.stdout).to.contain('@@@ before:run error @@@');
    expect(err.stdout).not.to.contain('@@@ after:run @@@');
  });

  it('supports running user defined global hooks, when user throws error on after', async () => {
    const [err] = await presult(runCypress('index-global-hooks-overrides-error-after.js'));
    expect(err).not.to.be.undefined;
    expect(err.stdout).to.contain('@@@ before:run @@@');
    expect(err.stdout).to.contain('@@@ after:run error @@@');
  });

  it('supports running user defined global hooks when only 1 hook is defined', async () => {
    const [err, output] = await presult(
      runCypress('index-global-hooks-overrides-only-after.js', 'helloworld.js'),
    );
    expect(err).to.be.undefined;
    expect(output).to.contain('@@@ after:run @@@');
  });
});
