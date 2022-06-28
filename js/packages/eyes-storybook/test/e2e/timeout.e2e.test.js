const {describe, it, before, after} = require('mocha');
const path = require('path');
const {testServerInProcess} = require('@applitools/test-server');
const utils = require('@applitools/utils');
const {presult} = require('@applitools/functional-commons');
const snap = require('@applitools/snaptdout');

const envWithColor = {...process.env, FORCE_COLOR: true};
const spawnOptions = {stdio: 'pipe', env: envWithColor};

describe('storybook server timeout', () => {
  let closeTestServer;
  before(async () => {
    closeTestServer = (await testServerInProcess({port: 7272})).close;
  });

  after(async () => {
    await closeTestServer();
  });

  it('considers user provided server start timeout', async () => {
    const [err, result] = await presult(
      utils.process.sh(
        `node ${path.resolve(__dirname, '../../bin/eyes-storybook')} -f ${path.resolve(
          __dirname,
          'happy-config/timeout.config.js',
        )}`,
        {spawnOptions},
      ),
    );

    const stderr = err ? err.stderr : result.stderr;

    await snap(stderr, 'timeout');
  });
});
