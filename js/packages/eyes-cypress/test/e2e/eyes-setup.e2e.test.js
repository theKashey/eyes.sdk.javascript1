'use strict';
const {describe, it, after} = require('mocha');
const {expect} = require('chai');
const {exec} = require('child_process');
const {promisify: p} = require('util');
const path = require('path');
const {presult} = require('@applitools/functional-commons');
const utils = require('@applitools/utils');
const {readFileSync, writeFileSync, existsSync, rmdirSync, unlinkSync} = require('fs');

const pexec = p(exec);
const cwd = process.cwd();
const {version: packageVersion} = require('../../package.json');
const sourceTestAppPath = path.resolve(__dirname, '../fixtures/setup');
const targetTestAppPath = path.resolve(__dirname, '../fixtures/testAppCopies/testApp-eyes-setup');
const {pluginRequire} = require('../../src/setup/addEyesCypressPlugin');
const {commandsImport} = require('../../src/setup/addEyesCommands');
const {eyesIndexContent} = require('../../src/setup/handleTypeScript');
const {removeStyleFromText} = require('../fixtures/utils/utils');
const binEyesSetupPath = path.resolve(__dirname, '../../bin/eyes-setup');

function runSetupScript() {
  return utils.process.sh(`node ${binEyesSetupPath}`, {spawnOptions: {stdio: 'pipe'}});
}

describe('eyes-setup script (e2e)', () => {
  let originalPackageJson,
    packageJsonPath,
    packageJson,
    pluginFilePath,
    origPluginFileContent,
    origSupportFileContent,
    typescriptFilePath,
    origCypressConfigContent,
    cypressConfigPath,
    cypressJsonPath,
    supportFilePath;

  before(async () => {
    if (existsSync(targetTestAppPath)) {
      rmdirSync(targetTestAppPath, {recursive: true});
    }
  });
  after(() => {
    process.chdir(cwd);
  });
  beforeEach(async () => {
    await pexec(`cp -r ${sourceTestAppPath}/. ${targetTestAppPath}`);
    process.chdir(targetTestAppPath);
    pluginFilePath = path.resolve('cypress/plugins/index-bla-plugin.js');

    origPluginFileContent = readFileSync(pluginFilePath).toString();

    supportFilePath = path.resolve('cypress/support/index-bla-commands.js');
    origSupportFileContent = readFileSync(supportFilePath).toString();

    typescriptFilePath = path.resolve('cypress/support/index.d.ts');
    cypressConfigPath = path.resolve('cypress.config.js');
    cypressJsonPath = path.resolve('cypress.json');
    origCypressConfigContent = readFileSync(cypressConfigPath, 'utf-8');

    packageJsonPath = path.resolve('package.json');
    originalPackageJson = JSON.parse(readFileSync(packageJsonPath));
    packageJson = Object.assign({}, originalPackageJson);
  });
  afterEach(async () => {
    rmdirSync(targetTestAppPath, {recursive: true});
    try {
      delete require.cache[require.resolve(binEyesSetupPath)];
    } catch (e) {}
  });

  it('works for cypress version < 10', async () => {
    const cypressVersion = '9.7.0';
    packageJson.dependencies.cypress = cypressVersion;
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    await pexec(`npm install`);

    const [err, result] = await presult(runSetupScript());
    expect(err).to.be.undefined;

    expect(removeStyleFromText(result.stdout)).to.equal(
      `Setup Eyes-Cypress ${packageVersion}
Cypress version: ${cypressVersion}
Plugins defined.
Commands defined.
TypeScript defined.
Setup done!
`,
    );

    expect(readFileSync(pluginFilePath).toString()).to.equal(
      origPluginFileContent.replace(/};\n$/, `};\n${pluginRequire}`),
    );

    expect(readFileSync(supportFilePath).toString()).to.equal(
      origSupportFileContent.replace(
        '\n// Import commands.js using ES2015 syntax:',
        `${commandsImport}\n\n// Import commands.js using ES2015 syntax:`,
      ),
    );
    expect(readFileSync(typescriptFilePath).toString()).to.equal(eyesIndexContent);
  });

  it(`works for cypress version >= 10`, async () => {
    const cypressVersion = '10.6.0';
    packageJson.dependencies.cypress = cypressVersion;
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    await pexec(`npm install`);

    const [err, result] = await presult(runSetupScript());
    expect(err).to.be.undefined;

    expect(removeStyleFromText(result.stdout)).to.equal(
      `Setup Eyes-Cypress ${packageVersion}
Cypress version: ${cypressVersion}
Plugins defined.
Commands defined.
TypeScript defined.
Setup done!
`,
    );

    expect(readFileSync(cypressConfigPath).toString()).to.equal(
      origCypressConfigContent.replace(/}\);\n$/, `});\n${pluginRequire}`),
    );

    expect(readFileSync(supportFilePath).toString()).to.equal(
      origSupportFileContent.replace(
        '\n// Import commands.js using ES2015 syntax:',
        `${commandsImport}\n\n// Import commands.js using ES2015 syntax:`,
      ),
    );

    expect(readFileSync(typescriptFilePath).toString()).to.equal(eyesIndexContent);
  });

  it(`works when missing config file in version >=10 (before 'npx cypress open')`, async () => {
    const cypressVersion = '10.6.0';
    packageJson.dependencies.cypress = cypressVersion;
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    await pexec(`npm install`);

    unlinkSync(cypressConfigPath);

    const [err, _result] = await presult(runSetupScript());

    expect(err).not.to.be.undefined;
    expect(removeStyleFromText(err.stdout)).to.equal(
      `Setup Eyes-Cypress ${packageVersion}
Cypress version: ${cypressVersion}
Setup error:
No configuration file found at ${cypressConfigPath}. This is usually caused by setting up Eyes before setting up Cypress. Please run "npx cypress open" first.
`,
    );
  });

  it(`works when missing config file in version <=9 (before 'npx cypress open')`, async () => {
    const cypressVersion = '9.7.0';
    packageJson.dependencies.cypress = cypressVersion;
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    await pexec(`npm install`);

    unlinkSync(cypressJsonPath);

    const [err, _result] = await presult(runSetupScript());

    expect(err).not.to.be.undefined;
    expect(removeStyleFromText(err.stdout)).to.equal(
      `Setup Eyes-Cypress ${packageVersion}
Cypress version: ${cypressVersion}
Setup error:
No configuration file found at ${cypressJsonPath}. This is usually caused by setting up Eyes before setting up Cypress. Please run "npx cypress open" first.
`,
    );
  });
});
