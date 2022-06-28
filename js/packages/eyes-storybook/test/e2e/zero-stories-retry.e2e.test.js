const {describe, it} = require('mocha');
const path = require('path');
const {presult} = require('@applitools/functional-commons');
const utils = require('@applitools/utils');
const snap = require('@applitools/snaptdout');
const {version} = require('../../package.json');

const envWithColor = {...process.env, FORCE_COLOR: true};
const spawnOptions = {stdio: 'pipe', env: envWithColor};

describe('zero stories retry', () => {
  //skipped as storybook removed the option to load a story after storybook starts
  // going forward we would like to re-add this test by running it with Storybook version 5
  it.skip('zero stories retry', async () => {
    const [err, result] = await presult(
      utils.process.sh(
        `node ${path.resolve(__dirname, '../../bin/eyes-storybook')} -f ${path.resolve(
          __dirname,
          '../fixtures/zeroStoriesRetry/applitools.config.js',
        )}`,
        {spawnOptions},
      ),
    );
    const stdout = err ? err.stdout : result.stdout;

    const output = stdout
      .replace(/\/.*.bin\/start-storybook/, '<story_book_path>')
      .replace(/Total time\: \d+ seconds/, 'Total time: <some_time> seconds')
      .replace(
        /See details at https\:\/\/.+.applitools.com\/app\/test-results\/.+/g,
        'See details at <some_url>',
      )
      .replace(version, '<version>')
      .replace(/\d+(?:\.\d+)+/g, '<browser_version>');

    await snap(output, 'zero stories retry');
  });
});
