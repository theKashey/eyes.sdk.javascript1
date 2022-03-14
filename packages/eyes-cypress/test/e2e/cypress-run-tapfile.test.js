'use strict';
const {describe, it, before, after} = require('mocha');
const {expect} = require('chai');
const {exec} = require('child_process');
const {promisify: p} = require('util');
const path = require('path');
const pexec = p(exec);
const fs = require('fs');
const {presult} = require('@applitools/functional-commons');
const readFile = p(fs.readFile);
const applitoolsConfig = require('../fixtures/testApp/applitools.config.js');

const sourceTestAppPath = path.resolve(__dirname, '../fixtures/testApp');
const targetTestAppPath = path.resolve(__dirname, '../fixtures/testAppCopies/testApp-tapfile');
const cwd = process.cwd();

async function runCypress(pluginsFile, testFile = 'helloworld.js') {
  return (
    await pexec(
      `./node_modules/.bin/cypress run --headless --config testFiles=${testFile},integrationFolder=cypress/integration-run,pluginsFile=cypress/plugins/${pluginsFile},supportFile=cypress/support/index-run.js`,
      {
        maxBuffer: 10000000,
      },
    )
  ).stdout;
}

const readTapFile = async tapFilePath => {
  return await readFile(tapFilePath, 'utf8');
};

describe('tap file', () => {
  before(async () => {
    if (fs.existsSync(targetTestAppPath)) {
      fs.rmdirSync(targetTestAppPath, {recursive: true});
    }
    await pexec(`cp -r ${sourceTestAppPath}/. ${targetTestAppPath}`);
  });

  after(async () => {
    fs.rmdirSync(targetTestAppPath, {recursive: true});
  });

  it(`supports creating '.tap' file from browser hooks`, async () => {
    process.chdir(targetTestAppPath);
    await pexec(`npm install`, {
      maxBuffer: 1000000,
    });

    const helloWorldAppData = {
      appName: 'Hello World!',
      testName: 'My first JavaScript test!',
    };
    const outputLine = `[PASSED TEST] Test: '${helloWorldAppData.testName}', Application: '${helloWorldAppData.appName}'`;
    const config = {...applitoolsConfig, tapDirPath: './'};
    fs.writeFileSync(
      `${targetTestAppPath}/applitools.config.js`,
      'module.exports =' + JSON.stringify(config, 2, null),
    );
    const [err] = await presult(runCypress('index-run.js', 'helloworld.js'));
    expect(err).to.be.undefined;
    const dirCont = fs.readdirSync(targetTestAppPath);
    const files = dirCont.filter(function(elm) {
      return elm.match(/.*\.(tap?)/gi);
    });
    expect(files.length).to.equal(1, `Created ${files.length} .tap file(s)`);
    const tapFilePath = path.resolve(targetTestAppPath, files[0]);
    const tapFileContent = await readTapFile(tapFilePath);
    expect(tapFileContent).to.include(outputLine, '.tap file content match');
    fs.unlinkSync(tapFilePath);
  });

  it(`supports creating '.tap' file from global hooks`, async () => {
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

    const helloWorldAppData = {
      appName: 'Hello World!',
      testName: 'My first JavaScript test!',
    };
    const outputLine = `[PASSED TEST] Test: '${helloWorldAppData.testName}', Application: '${helloWorldAppData.appName}'`;
    const config = {...applitoolsConfig, tapDirPath: './'};
    fs.writeFileSync(
      `${targetTestAppPath}/applitools.config.js`,
      'module.exports =' + JSON.stringify(config, 2, null),
    );
    const [err] = await presult(
      runCypress('index-global-hooks-overrides-tap-dir.js', 'helloworld.js'),
    );
    expect(err).to.be.undefined;
    const dirCont = fs.readdirSync(targetTestAppPath);
    const files = dirCont.filter(function(elm) {
      return elm.match(/.*\.(tap?)/gi);
    });
    expect(files.length).to.equal(1, `Created ${files.length} .tap file(s)`);
    const tapFilePath = path.resolve(targetTestAppPath, files[0]);
    const tapFileContent = await readTapFile(tapFilePath);
    expect(tapFileContent).to.include(outputLine, '.tap file content match');
    fs.unlinkSync(tapFilePath);
  });
});
