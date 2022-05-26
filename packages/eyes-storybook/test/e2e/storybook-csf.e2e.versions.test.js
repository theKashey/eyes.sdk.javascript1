const {describe, it, before} = require('mocha');
const path = require('path');
const {delay: _psetTimeout, presult} = require('@applitools/functional-commons');
const utils = require('@applitools/utils');
const snap = require('@applitools/snaptdout');
const {copyStoriesToVersionDir} = require('../fixtures/storybook-versions/copyStoriesToVersionDir');
const {version} = require('../../package.json');

const envWithColor = {...process.env, FORCE_COLOR: true};
const spawnOptions = {stdio: 'pipe', env: envWithColor};
const storybookVersion = process.env.STORYBOOK_VERSION;
const storybookSourceDir = path.resolve(__dirname, '../fixtures/storybookCSF/');
const testConfigFile = path.resolve(
  __dirname,
  '../e2e/happy-config/storybook-csf.versions.config.js',
);

const eyesStorybookPath = path.resolve(__dirname, '../../bin/eyes-storybook');

describe('storybook-csf', () => {
  before(async () => {
    await copyStoriesToVersionDir({storybookSourceDir, storybookVersion});
  });

  it(`renders storybook in version ${storybookVersion} and CSF format and takes snapshot after play function ends`, async () => {
    const [err, result] = await presult(
      utils.process.sh(`node ${eyesStorybookPath} -f ${testConfigFile}`, {spawnOptions}),
    );
    const stdout = err ? err.stdout : result.stdout;
    const output = stdout
      .replace(/Total time\: \d+ seconds/, 'Total time: <some_time> seconds')
      .replace(
        /See details at https\:\/\/.+.applitools.com\/app\/test-results\/.+/g,
        'See details at <some_url>',
      )
      .replace(version, '<version>')
      .replace(/\d+(?:\.\d+)+/g, '<browser_version>');

    await snap(output, `storybook version ${storybookVersion} with CSF and play function`);
  });
});
