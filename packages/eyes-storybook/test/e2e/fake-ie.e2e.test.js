const {describe, it} = require('mocha');
const path = require('path');
const {presult} = require('@applitools/functional-commons');
const {sh} = require('@applitools/sdk-shared/src/process-commons');
const snap = require('@applitools/snaptdout');
const {version} = require('../../package.json');

describe('fake ie', () => {
  it('fake ie in storybook', async () => {
    const [err, result] = await presult(
      sh(
        `node ${path.resolve(__dirname, '../../bin/eyes-storybook')} -f ${path.resolve(
          __dirname,
          '../fixtures/fakeIE/applitools.config.js',
        )}`,
        {
          spawnOptions: {stdio: 'pipe'},
        },
      ),
    );
    const stdout = err ? err.stdout : result.stdout;
    console.log('before', stdout);
    const output = stdout
      .replace(/\/.*.bin\/start-storybook/, '<story_book_path>')
      .replace(/Total time\: \d+ seconds/, 'Total time: <some_time> seconds')
      .replace(
        /See details at https\:\/\/.+.applitools.com\/app\/test-results\/.+/g,
        'See details at <some_url>',
      )
      .replace(version, '<version>');
    console.log('after', output);
    await snap(output, 'fake ie');
  });
});
